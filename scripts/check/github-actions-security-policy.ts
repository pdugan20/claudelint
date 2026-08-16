import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

type YamlRecord = Record<string, unknown>;
type Permission = 'none' | 'read' | 'write';
type PermissionMap = Record<string, Permission>;

interface ActionProvenance {
  sha: string;
  version: string;
}

interface UsesEntry {
  comment?: string;
  location: string;
  step: YamlRecord;
  value: unknown;
}

interface UsesSourceEntry {
  comment?: string;
  value: unknown;
}

interface PermissionResult {
  map: PermissionMap;
  valid: boolean;
}

const REQUIRED_WORKFLOWS = [
  'ci.yml',
  'labeler.yml',
  'pr-lint.yml',
  'pr-size.yml',
  'publish.yml',
  'stale.yml',
  'upstream-watch.yml',
  'welcome.yml',
] as const;

const RELEASE_PACKAGE_SCRIPT = 'bash scripts/util/package-plugin.sh';
const RELEASE_PACKAGE_SHA256 = 'a34a41ecdda6ffe2174f5d9ac2237f16fd602685162efb1aee45c5b1e9f552b8';
const PROFILE_MANIFEST = 'scripts/check/github-automation-profiles.json';
const BUILTIN_GITHUB_TOKEN = /^\${{\s*(?:github\.token|secrets\.GITHUB_TOKEN)\s*}}$/;
const SEMVER_COMMENT = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const FULL_SHA = /^[0-9a-f]{40}$/;
const FULL_SHA256 = /^[0-9a-f]{64}$/;
const FORBIDDEN_ACTION =
  /(?:auto.?merge|auto.?approve|approve.?pull.?request|pull.?request.?approve)/i;
const APP_TOKEN_ACTION = /(?:^|\/)create-github-app-token$/i;
const DYNAMIC_EXPRESSION = /\${{/;

// Activation is the ABSENCE of an enabled key: the exact-serialization
// equality below rejects both a re-disable and a redundant enabled:true.
const RENOVATE_ACTIVATED_CONTRACT = {
  $schema: 'https://docs.renovatebot.com/renovate-schema.json',
  extends: ['config:recommended'],
  enabledManagers: ['npm', 'github-actions'],
  timezone: 'America/Los_Angeles',
  dependencyDashboard: true,
  dependencyDashboardAutoclose: true,
  labels: ['dependencies'],
  semanticCommits: 'enabled',
  branchConcurrentLimit: 3,
  prConcurrentLimit: 3,
  prHourlyLimit: 2,
  rebaseWhen: 'behind-base-branch',
  platformAutomerge: true,
  automergeType: 'pr',
  automergeStrategy: 'squash',
  internalChecksFilter: 'strict',
  minimumReleaseAgeBehaviour: 'timestamp-required',
  prCreation: 'not-pending',
  ignoreUnstable: true,
  vulnerabilityAlerts: { enabled: false },
  lockFileMaintenance: {
    enabled: true,
    schedule: ['before 6am on monday'],
    dependencyDashboardApproval: true,
    automerge: false,
  },
  packageRules: [
    {
      description: 'Default every enabled manager to dashboard approval',
      matchManagers: ['npm', 'github-actions'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'Stable npm runtime non-major updates',
      matchManagers: ['npm'],
      matchDepTypes: ['dependencies', 'optionalDependencies'],
      matchCurrentVersion: '/^[1-9]\\d*\\.\\d+\\.\\d+$/',
      matchUpdateTypes: ['patch', 'minor'],
      groupName: 'runtime dependencies',
      minimumReleaseAge: '7 days',
      dependencyDashboardApproval: false,
      automerge: true,
    },
    {
      description: 'Stable npm development non-major updates',
      matchManagers: ['npm'],
      matchDepTypes: ['devDependencies'],
      matchCurrentVersion: '/^[1-9]\\d*\\.\\d+\\.\\d+$/',
      matchUpdateTypes: ['patch', 'minor'],
      groupName: 'development dependencies',
      minimumReleaseAge: '7 days',
      dependencyDashboardApproval: false,
      automerge: true,
    },
    {
      description: 'Runtime and package-manager contracts require exception handling',
      matchManagers: ['npm'],
      matchPackageNames: ['node', 'npm', 'typescript', '@types/node'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'GitHub Actions require immutable-provenance reconciliation',
      matchManagers: ['github-actions'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'Pin, digest, and unsupported update types require exception handling',
      matchUpdateTypes: ['digest', 'pin', 'pinDigest', 'rollback', 'bump', 'replacement'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'Lockfile maintenance requires exception handling',
      matchUpdateTypes: ['lockFileMaintenance'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'Pre-1.0 updates require exception handling',
      matchCurrentVersion: '/^0\\./',
      matchUpdateTypes: ['patch', 'minor', 'major'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
    {
      description: 'All major updates require exception handling',
      matchUpdateTypes: ['major'],
      dependencyDashboardApproval: true,
      automerge: false,
    },
  ],
} as const;

const FORBIDDEN_RUN_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bgh\s+pr\s+merge\b/i, 'GitHub CLI pull request merge'],
  [/\bgh\s+pr\s+review\b[^\n]*(?:--approve|-a)\b/i, 'GitHub CLI pull request approval'],
  [/\b(?:github|octokit)\.rest\.pulls\.merge\s*\(/i, 'Octokit pull request merge mutation'],
  [
    /\b(?:github|octokit)\.rest\.pulls\.createReview\s*\([\s\S]{0,500}\bAPPROVE\b/i,
    'Octokit pull request approval mutation',
  ],
  [/\/pulls\/[^\n"']{1,300}\/merge\b/i, 'REST pull request merge endpoint'],
  [/\/pulls\/[^\n"']{1,300}\/reviews\b[\s\S]{0,500}\bAPPROVE\b/i, 'REST approval endpoint'],
  [/\bmergePullRequest\b/i, 'GraphQL pull request merge mutation'],
  [/\benablePullRequestAutoMerge\b/i, 'GraphQL automatic merge mutation'],
  [/\baddPullRequestReview\b[\s\S]{0,500}\bAPPROVE\b/i, 'GraphQL approval mutation'],
];

function asRecord(value: unknown): YamlRecord | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as YamlRecord;
}

function parseYaml(
  path: string,
  relativePath: string,
  violations: string[]
): YamlRecord | undefined {
  try {
    const parsed = asRecord(load(readFileSync(path, 'utf8')));
    if (!parsed) violations.push(`${relativePath}: YAML root must be an object`);
    return parsed;
  } catch (error) {
    violations.push(`${relativePath}: invalid YAML (${String(error)})`);
    return undefined;
  }
}

function parsePermissions(
  value: unknown,
  location: string,
  violations: string[]
): PermissionResult {
  const record = asRecord(value);
  if (!record) {
    violations.push(`${location}: permissions must be an explicit map; shorthands are forbidden`);
    return { map: {}, valid: false };
  }

  const map: PermissionMap = {};
  let valid = true;
  for (const [scope, permission] of Object.entries(record)) {
    if (permission !== 'read' && permission !== 'write' && permission !== 'none') {
      violations.push(`${location}: permission ${scope} must be read, write, or none`);
      valid = false;
      continue;
    }
    map[scope] = permission;
  }
  return { map, valid };
}

function isMergeCapable(permissions: PermissionResult): boolean {
  return (
    !permissions.valid ||
    permissions.map.contents === 'write' ||
    permissions.map['pull-requests'] === 'write'
  );
}

function splitYamlComment(value: string): { comment?: string; scalar: string } {
  let doubleQuoted = false;
  let singleQuoted = false;
  let escaped = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (doubleQuoted && escaped) {
      escaped = false;
    } else if (doubleQuoted && character === '\\') {
      escaped = true;
    } else if (!singleQuoted && character === '"') {
      doubleQuoted = !doubleQuoted;
    } else if (!doubleQuoted && character === "'") {
      if (singleQuoted && value[index + 1] === "'") index += 1;
      else singleQuoted = !singleQuoted;
    } else if (
      character === '#' &&
      !doubleQuoted &&
      !singleQuoted &&
      (index === 0 || /\s/.test(value[index - 1]))
    ) {
      return { comment: value.slice(index + 1).trim(), scalar: value.slice(0, index).trim() };
    }
  }
  return { scalar: value.trim() };
}

function collectUsesSourceEntries(
  source: string,
  relativePath: string,
  violations: string[]
): UsesSourceEntry[] {
  const entries: UsesSourceEntry[] = [];
  let blockScalarIndent: number | undefined;
  for (const [index, line] of source.split('\n').entries()) {
    const indentation = line.match(/^ */)?.[0].length ?? 0;
    if (blockScalarIndent !== undefined) {
      if (!line.trim() || indentation > blockScalarIndent) continue;
      blockScalarIndent = undefined;
    }
    if (/^\s*(?:-\s*)?[\w-]+\s*:\s*[>|](?:[+-][1-9]?|[1-9][+-]?)?\s*(?:#.*)?$/.test(line)) {
      blockScalarIndent = indentation;
      continue;
    }
    const match = line.match(/^\s*(?:-\s*)?uses\s*:\s*(.*)$/);
    if (!match) continue;
    const { comment, scalar } = splitYamlComment(match[1]);
    try {
      entries.push({ comment, value: asRecord(load(`value: ${scalar}`))?.value });
    } catch (error) {
      violations.push(
        `${relativePath}:${index + 1}: could not parse uses scalar (${String(error)})`
      );
    }
  }
  return entries;
}

function checkCheckout(entry: UsesEntry, actionId: string, violations: string[]): void {
  if (actionId !== 'actions/checkout') return;
  const withConfig = asRecord(entry.step.with);
  if (
    withConfig?.['persist-credentials'] !== false &&
    withConfig?.['persist-credentials'] !== 'false'
  ) {
    violations.push(`${entry.location}: checkout persist-credentials must be false`);
  }
}

function hasDynamicValue(value: unknown): boolean {
  if (typeof value === 'string') {
    return DYNAMIC_EXPRESSION.test(value) && !BUILTIN_GITHUB_TOKEN.test(value);
  }
  if (Array.isArray(value)) return value.some(hasDynamicValue);
  const record = asRecord(value);
  return record ? Object.values(record).some(hasDynamicValue) : false;
}

function forEachString(value: unknown, callback: (value: string) => void): void {
  if (typeof value === 'string') {
    callback(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) forEachString(entry, callback);
    return;
  }
  const record = asRecord(value);
  if (record) for (const entry of Object.values(record)) forEachString(entry, callback);
}

function expressionBodies(value: string): string[] {
  return [...value.matchAll(/\${{([\s\S]*?)}}/g)].map((match) => match[1]);
}

function hasSecretNamespace(value: unknown): boolean {
  let found = false;
  forEachString(value, (text) => {
    if (BUILTIN_GITHUB_TOKEN.test(text)) return;
    if (expressionBodies(text).some((body) => /\bsecrets\b/i.test(body))) found = true;
  });
  return found;
}

function hasEventControlledValue(value: unknown): boolean {
  let found = false;
  forEachString(value, (text) => {
    for (const body of expressionBodies(text)) {
      if (/\bgithub\s*\.\s*event\b/i.test(body) || /\bgithub\s*\[/i.test(body)) {
        found = true;
      }
    }
  });
  return found;
}

function hasWorkflowTrigger(value: unknown, trigger: string): boolean {
  if (value === trigger) return true;
  if (Array.isArray(value)) return value.includes(trigger);
  return Object.prototype.hasOwnProperty.call(asRecord(value) ?? {}, trigger);
}

function hasStructuredWorkflowTrigger(value: unknown, trigger: string): boolean {
  const triggers = asRecord(value);
  if (!triggers || !Object.prototype.hasOwnProperty.call(triggers, trigger)) return false;
  const configuration = triggers[trigger];
  return configuration === null || asRecord(configuration) !== undefined;
}

function checkAction(
  entry: UsesEntry,
  provenance: Record<string, ActionProvenance>,
  usedProvenance: Set<string>,
  mergeCapable: boolean,
  untrustedPullRequest: boolean,
  violations: string[]
): void {
  if (typeof entry.value !== 'string' || DYNAMIC_EXPRESSION.test(entry.value)) {
    violations.push(`${entry.location}: action reference must be a fixed string`);
    return;
  }
  const reference = entry.value;
  if (
    mergeCapable &&
    hasEventControlledValue({
      env: entry.step.env,
      secrets: entry.step.secrets,
      with: entry.step.with,
    })
  ) {
    violations.push(`${entry.location}: merge-capable action values must not be event-controlled`);
  }
  if (mergeCapable && hasDynamicValue(entry.step.with)) {
    violations.push(`${entry.location}: merge-capable action inputs must not be dynamic`);
  }
  if (reference.startsWith('./')) {
    if (mergeCapable) {
      violations.push(`${entry.location}: merge-capable jobs may not delegate to a local action`);
    }
    return;
  }
  if (reference.startsWith('docker://')) {
    if (!/^docker:\/\/[^\s@]+@sha256:[0-9a-f]{64}$/.test(reference)) {
      violations.push(`${entry.location}: Docker action must be pinned to a sha256 digest`);
    }
    return;
  }

  const separator = reference.lastIndexOf('@');
  const actionId = separator > 0 ? reference.slice(0, separator) : reference;
  const sha = separator > 0 ? reference.slice(separator + 1) : '';
  usedProvenance.add(actionId);
  if (!FULL_SHA.test(sha)) {
    violations.push(`${entry.location}: action is not pinned to a 40-character commit`);
    return;
  }
  const expected = provenance[actionId];
  if (!expected || expected.sha !== sha) {
    violations.push(
      `${entry.location}: action pin does not match exact provenance for ${actionId}`
    );
  }
  if (
    !entry.comment ||
    !SEMVER_COMMENT.test(entry.comment) ||
    entry.comment !== expected?.version
  ) {
    violations.push(
      `${entry.location}: release comment does not match exact provenance for ${actionId}`
    );
  }
  if (FORBIDDEN_ACTION.test(actionId)) {
    violations.push(`${entry.location}: forbidden approval or automatic merge action ${actionId}`);
  }
  checkCheckout(entry, actionId, violations);
  if (mergeCapable && untrustedPullRequest && actionId === 'actions/checkout') {
    violations.push(
      `${entry.location}: merge-capable pull_request job may not checkout untrusted code`
    );
  }
}

function isExactCodecovStep(filename: string, mergeCapable: boolean, step: YamlRecord): boolean {
  const withConfig = asRecord(step.with);
  const otherWith = { ...withConfig };
  delete otherWith.token;
  const withoutToken = { ...step, with: otherWith };
  return (
    filename === 'ci.yml' &&
    !mergeCapable &&
    step.uses === 'codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f' &&
    withConfig?.token === '${{ secrets.CODECOV_TOKEN }}' &&
    !hasSecretNamespace(withoutToken)
  );
}

function tokenSinkIsUnbounded(record: YamlRecord | undefined): boolean {
  if (!record) return false;
  for (const [key, value] of Object.entries(record)) {
    if (
      !/^(?:GH_TOKEN|GITHUB_TOKEN|github-token|github_token|repo-token|repo_token|token)$/i.test(
        key
      )
    ) {
      continue;
    }
    if (typeof value !== 'string' || !BUILTIN_GITHUB_TOKEN.test(value)) return true;
  }
  return false;
}

function checkTokenUse(
  filename: string,
  location: string,
  step: YamlRecord,
  mergeCapable: boolean,
  violations: string[]
): boolean {
  let unbounded = false;
  const exactCodecov = isExactCodecovStep(filename, mergeCapable, step);
  const hasCustomSecret = hasSecretNamespace(step);
  if (JSON.stringify(step).includes('CODECOV_TOKEN') && !exactCodecov) {
    violations.push(
      `${location}: CODECOV_TOKEN is allowed only on the exact pinned Codecov action`
    );
    unbounded = true;
  }
  if (hasCustomSecret && !exactCodecov) {
    violations.push(`${location}: custom secret is an unbounded GitHub token`);
    unbounded = true;
  }
  const uses = typeof step.uses === 'string' ? step.uses.split('@')[0] : '';
  if (APP_TOKEN_ACTION.test(uses)) {
    violations.push(`${location}: GitHub App token creation is an unbounded GitHub token`);
    unbounded = true;
  }
  if (
    tokenSinkIsUnbounded(asRecord(step.env)) ||
    (!exactCodecov && tokenSinkIsUnbounded(asRecord(step.with))) ||
    tokenSinkIsUnbounded(asRecord(step.secrets)) ||
    step.secrets === 'inherit'
  ) {
    violations.push(
      `${location}: custom credential in a GitHub token sink is an unbounded GitHub token`
    );
    unbounded = true;
  }
  return unbounded;
}

function checkInlineRun(location: string, run: string, violations: string[]): void {
  for (const [pattern, description] of FORBIDDEN_RUN_PATTERNS) {
    if (pattern.test(run)) violations.push(`${location}: forbidden ${description}`);
  }
}

function checkEmbeddedStrings(location: string, value: unknown, violations: string[]): void {
  forEachString(value, (text) => checkInlineRun(location, text, violations));
}

function checkReleaseArtifacts(projectRoot: string, violations: string[]): boolean {
  let exact = true;

  try {
    const packageJson = JSON.parse(
      readFileSync(join(projectRoot, 'package.json'), 'utf8')
    ) as unknown;
    const scripts = asRecord(asRecord(packageJson)?.scripts);
    if (scripts?.['package:plugin'] !== RELEASE_PACKAGE_SCRIPT) exact = false;
  } catch {
    exact = false;
  }
  try {
    const digest = createHash('sha256')
      .update(readFileSync(join(projectRoot, 'scripts/util/package-plugin.sh')))
      .digest('hex');
    if (digest !== RELEASE_PACKAGE_SHA256) exact = false;
  } catch {
    exact = false;
  }
  if (!exact)
    violations.push('.github/workflows/publish.yml: exact github-release profile drifted');
  return exact;
}

function checkExactProfile(
  relativePath: string,
  source: string | Buffer,
  profiles: Record<string, string>
): boolean {
  const expected = profiles[relativePath];
  if (!expected) return false;
  return createHash('sha256').update(source).digest('hex') === expected;
}

function checkDependabot(
  projectRoot: string,
  profiles: Record<string, string>,
  usedProfiles: Set<string>,
  violations: string[]
): void {
  const relativePath = '.github/dependabot.yml';
  try {
    if (!checkExactProfile(relativePath, readFileSync(join(projectRoot, relativePath)), profiles)) {
      violations.push(`${relativePath}: exact Dependabot profile drifted`);
    } else {
      usedProfiles.add(relativePath);
    }
  } catch (error) {
    violations.push(`${relativePath}: could not read exact Dependabot profile (${String(error)})`);
  }
}

function checkPrLintTitleGate(projectRoot: string, violations: string[]): void {
  const relativePath = '.github/workflows/pr-lint.yml';
  // Load-bearing after the Dependabot security-only handoff: alert-driven
  // security PRs carry the "[security] "/"[Security] " subject marker, and
  // "Validate PR Title" is a required context, so narrowing the pattern,
  // requiring a scope (actions security PRs have none), or shrinking the
  // types allowlist makes future security or Renovate PRs unmergeable.
  const expectedTypes = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'deps',
    'revert',
  ];
  const expectedPattern = '^(\\[[Ss]ecurity\\] [A-Za-z]|[a-z]).*$';
  try {
    const workflow = load(readFileSync(join(projectRoot, relativePath), 'utf8')) as {
      jobs?: Record<string, { steps?: { with?: Record<string, unknown>; if?: unknown }[] }>;
    };
    const gateSteps: { with?: Record<string, unknown>; if?: unknown }[] = [];
    for (const job of Object.values(workflow.jobs ?? {})) {
      for (const step of job.steps ?? []) {
        if (step.with && 'subjectPattern' in step.with) {
          gateSteps.push(step);
        }
      }
    }
    if (gateSteps.length !== 1 || gateSteps[0].with?.subjectPattern !== expectedPattern) {
      violations.push(
        `${relativePath}: PR title gate must pin exactly the security-aware subjectPattern`
      );
      return;
    }
    if ('if' in gateSteps[0]) {
      violations.push(
        `${relativePath}: PR title gate step must not be conditional (a skipped step reports the required context vacuously)`
      );
    }
    const gate = gateSteps[0].with as Record<string, unknown>;
    const types =
      typeof gate.types === 'string'
        ? gate.types
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        : null;
    if (!types || JSON.stringify(types) !== JSON.stringify(expectedTypes)) {
      violations.push(`${relativePath}: PR title gate must pin the exact types allowlist`);
    }
    if (gate.requireScope !== false) {
      violations.push(
        `${relativePath}: PR title gate must keep requireScope false (actions security PRs carry no scope)`
      );
    }
  } catch (error) {
    violations.push(`${relativePath}: could not read PR title gate (${String(error)})`);
  }
}

function checkRenovate(projectRoot: string, violations: string[]): void {
  const relativePath = 'renovate.json';
  try {
    const source = readFileSync(join(projectRoot, relativePath), 'utf8');
    const parsed = JSON.parse(source) as unknown;
    load(source);
    if (JSON.stringify(parsed) !== JSON.stringify(RENOVATE_ACTIVATED_CONTRACT)) {
      violations.push(`${relativePath}: exact activated Renovate policy drifted`);
    }
  } catch (error) {
    violations.push(
      `${relativePath}: could not read exact activated policy (${String(error)})`
    );
  }
}

function readProvenance(
  projectRoot: string,
  violations: string[]
): Record<string, ActionProvenance> {
  const relativePath = 'scripts/check/github-actions-provenance.json';
  try {
    const parsed = asRecord(JSON.parse(readFileSync(join(projectRoot, relativePath), 'utf8')));
    if (!parsed) throw new Error('root must be an object');
    const provenance: Record<string, ActionProvenance> = {};
    for (const [actionId, value] of Object.entries(parsed)) {
      const entry = asRecord(value);
      if (
        !entry ||
        Object.keys(entry).length !== 2 ||
        typeof entry.sha !== 'string' ||
        !FULL_SHA.test(entry.sha) ||
        typeof entry.version !== 'string' ||
        !SEMVER_COMMENT.test(entry.version)
      ) {
        violations.push(`${relativePath}: invalid provenance entry for ${actionId}`);
        continue;
      }
      provenance[actionId] = { sha: entry.sha, version: entry.version };
    }
    return provenance;
  } catch (error) {
    violations.push(`${relativePath}: could not read provenance (${String(error)})`);
    return {};
  }
}

function readProfiles(projectRoot: string, violations: string[]): Record<string, string> {
  try {
    const parsed = asRecord(JSON.parse(readFileSync(join(projectRoot, PROFILE_MANIFEST), 'utf8')));
    if (!parsed) throw new Error('root must be an object');
    const profiles: Record<string, string> = {};
    for (const [relativePath, digest] of Object.entries(parsed)) {
      if (
        !/^\.github\/(?:dependabot\.yml|workflows\/[A-Za-z0-9_.-]+\.ya?ml)$/.test(relativePath) ||
        typeof digest !== 'string' ||
        !FULL_SHA256.test(digest)
      ) {
        violations.push(`${PROFILE_MANIFEST}: invalid exact profile entry for ${relativePath}`);
        continue;
      }
      profiles[relativePath] = digest;
    }
    return profiles;
  } catch (error) {
    violations.push(`${PROFILE_MANIFEST}: could not read exact profiles (${String(error)})`);
    return {};
  }
}

function checkWorkflow(
  projectRoot: string,
  filename: string,
  workflow: YamlRecord,
  source: string,
  provenance: Record<string, ActionProvenance>,
  usedProvenance: Set<string>,
  profiles: Record<string, string>,
  usedProfiles: Set<string>,
  violations: string[]
): void {
  const relativePath = `.github/workflows/${filename}`;
  if (filename === 'ci.yml' && !hasStructuredWorkflowTrigger(workflow.on, 'workflow_dispatch')) {
    violations.push(
      `${relativePath}: workflow_dispatch trigger is required for manual default-branch canaries`
    );
  }
  const jobs = asRecord(workflow.jobs);
  if (!jobs) {
    violations.push(`${relativePath}: jobs must be an object`);
    return;
  }

  const hasWorkflowPermissions = Object.prototype.hasOwnProperty.call(workflow, 'permissions');
  const workflowPermissions = hasWorkflowPermissions
    ? parsePermissions(workflow.permissions, `${relativePath}: workflow permissions`, violations)
    : undefined;
  const workflowProfileExact = checkExactProfile(relativePath, source, profiles);
  const releaseArtifactsExact =
    filename === 'publish.yml' ? checkReleaseArtifacts(projectRoot, violations) : false;
  if (filename === 'publish.yml' && !workflowProfileExact) {
    violations.push(`${relativePath}: exact release profile drifted`);
  }
  const untrustedPullRequest =
    hasWorkflowTrigger(workflow.on, 'pull_request') ||
    hasWorkflowTrigger(workflow.on, 'pull_request_target');
  const sourceUses = collectUsesSourceEntries(source, relativePath, violations);
  let usesIndex = 0;
  const workflowCredentialsUnbounded = checkTokenUse(
    filename,
    `${relativePath}: workflow`,
    { env: workflow.env },
    false,
    violations
  );
  let profileDriftReported = filename === 'publish.yml' && !workflowProfileExact;

  for (const [jobId, jobValue] of Object.entries(jobs)) {
    const job = asRecord(jobValue);
    const location = `${relativePath}:jobs.${jobId}`;
    if (!job) {
      violations.push(`${location}: job must be an object`);
      continue;
    }
    const hasJobPermissions = Object.prototype.hasOwnProperty.call(job, 'permissions');
    let permissions: PermissionResult;
    if (hasJobPermissions) {
      permissions = parsePermissions(job.permissions, `${location}: permissions`, violations);
    } else if (workflowPermissions) {
      permissions = workflowPermissions;
    } else {
      violations.push(`${location}: explicit workflow or job permissions are required`);
      permissions = { map: {}, valid: false };
    }

    let mergeCapable = isMergeCapable(permissions) || workflowCredentialsUnbounded;
    if (
      checkTokenUse(
        filename,
        location,
        { env: job.env, secrets: job.secrets, uses: job.uses, with: job.with },
        mergeCapable,
        violations
      )
    ) {
      mergeCapable = true;
    }
    checkEmbeddedStrings(
      location,
      { env: job.env, secrets: job.secrets, with: job.with },
      violations
    );
    const entries: UsesEntry[] = [];
    if ('uses' in job) {
      const sourceUse = sourceUses[usesIndex++];
      if (!sourceUse || sourceUse.value !== job.uses) {
        violations.push(`${location}: parsed uses reference does not match source`);
      }
      entries.push({ location, step: job, value: job.uses, comment: sourceUse?.comment });
    }
    const steps = Array.isArray(job.steps) ? job.steps : [];
    const parsedSteps: Array<{ index: number; step: YamlRecord }> = [];
    for (let index = 0; index < steps.length; index += 1) {
      const step = asRecord(steps[index]);
      if (!step) {
        violations.push(`${location}.steps[${index}]: step must be an object`);
        continue;
      }
      parsedSteps.push({ index, step });
    }

    let codecovAllowedBeforeEscalation = false;
    for (const { index, step } of parsedSteps) {
      const stepLocation = `${location}.steps[${index}]`;
      if (isExactCodecovStep(filename, mergeCapable, step)) {
        codecovAllowedBeforeEscalation = true;
      }
      if (checkTokenUse(filename, stepLocation, step, mergeCapable, violations)) {
        mergeCapable = true;
      }
    }
    if (mergeCapable && codecovAllowedBeforeEscalation) {
      violations.push(
        `${location}: CODECOV_TOKEN is allowed only on the exact pinned Codecov action in non-merge CI`
      );
    }
    const approvedPrivilegedProfile =
      mergeCapable &&
      workflowProfileExact &&
      (filename !== 'publish.yml' || jobId !== 'github-release' || releaseArtifactsExact);
    if (approvedPrivilegedProfile) {
      usedProfiles.add(relativePath);
    } else if (
      mergeCapable &&
      Object.prototype.hasOwnProperty.call(profiles, relativePath) &&
      !workflowProfileExact &&
      !profileDriftReported
    ) {
      violations.push(`${relativePath}: exact privileged workflow profile drifted`);
      profileDriftReported = true;
    }
    if (mergeCapable && !approvedPrivilegedProfile) {
      violations.push(
        `${location}: merge-capable job requires an exact privileged workflow profile`
      );
    }
    if (mergeCapable && !approvedPrivilegedProfile && hasEventControlledValue(workflow.env)) {
      violations.push(`${location}: merge-capable workflow env must not be event-controlled`);
    }
    if (mergeCapable && !approvedPrivilegedProfile && hasEventControlledValue(job.env)) {
      violations.push(`${location}: merge-capable job env must not be event-controlled`);
    }

    for (const { index, step } of parsedSteps) {
      const stepLocation = `${location}.steps[${index}]`;
      checkEmbeddedStrings(
        stepLocation,
        { env: step.env, secrets: step.secrets, with: step.with },
        violations
      );
      if ('uses' in step) {
        const sourceUse = sourceUses[usesIndex++];
        if (!sourceUse || sourceUse.value !== step.uses) {
          violations.push(`${stepLocation}: parsed uses reference does not match source`);
        }
        entries.push({
          location: stepLocation,
          step,
          value: step.uses,
          comment: sourceUse?.comment,
        });
      }
      if (typeof step.run === 'string') {
        checkInlineRun(stepLocation, step.run, violations);
        if (mergeCapable && !approvedPrivilegedProfile) {
          violations.push(`${stepLocation}: merge-capable jobs may not execute run steps`);
        }
      }
      if (mergeCapable && !approvedPrivilegedProfile && hasEventControlledValue(step.env)) {
        violations.push(`${stepLocation}: merge-capable step env must not be event-controlled`);
      }
    }
    for (const entry of entries) {
      checkAction(
        entry,
        provenance,
        usedProvenance,
        mergeCapable && !approvedPrivilegedProfile,
        untrustedPullRequest,
        violations
      );
    }
  }
}

export function checkGitHubActionsSecurity(projectRoot: string): string[] {
  const violations: string[] = [];
  const workflowsDirectory = join(projectRoot, '.github/workflows');
  const provenance = readProvenance(projectRoot, violations);
  const usedProvenance = new Set<string>();
  const profiles = readProfiles(projectRoot, violations);
  const usedProfiles = new Set<string>();
  let workflowFiles: string[] = [];
  try {
    workflowFiles = readdirSync(workflowsDirectory)
      .filter((name) => /\.ya?ml$/.test(name))
      .sort();
  } catch (error) {
    violations.push(`.github/workflows: could not read workflows (${String(error)})`);
  }

  for (const required of REQUIRED_WORKFLOWS) {
    if (!workflowFiles.includes(required)) {
      violations.push(`.github/workflows/${required}: classified workflow is missing`);
    }
  }
  for (const filename of workflowFiles) {
    const relativePath = `.github/workflows/${filename}`;
    const path = join(workflowsDirectory, filename);
    const source = readFileSync(path, 'utf8');
    const workflow = parseYaml(path, relativePath, violations);
    if (workflow)
      checkWorkflow(
        projectRoot,
        filename,
        workflow,
        source,
        provenance,
        usedProvenance,
        profiles,
        usedProfiles,
        violations
      );
  }
  for (const actionId of Object.keys(provenance)) {
    if (!usedProvenance.has(actionId)) {
      violations.push(
        `scripts/check/github-actions-provenance.json: unused provenance entry for ${actionId}`
      );
    }
  }
  checkRenovate(projectRoot, violations);
  checkPrLintTitleGate(projectRoot, violations);
  checkDependabot(projectRoot, profiles, usedProfiles, violations);
  for (const relativePath of Object.keys(profiles)) {
    if (!usedProfiles.has(relativePath)) {
      violations.push(`${PROFILE_MANIFEST}: unused profile entry for ${relativePath}`);
    }
  }
  return violations;
}
