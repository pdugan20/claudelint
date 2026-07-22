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
const RELEASE_WORKFLOW_SHA256 = '5e5f121491c2139c96a193a786c75109157565b55edb5d89e048bcbda74a015a';
const DEPENDABOT_SHA256 = '8211d28ccca08491451a5ef9bbee03398d7e3ddfca92555251d4d500f3e6d068';
const BUILTIN_GITHUB_TOKEN = /^\${{\s*(?:github\.token|secrets\.GITHUB_TOKEN)\s*}}$/;
const SEMVER_COMMENT = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const FULL_SHA = /^[0-9a-f]{40}$/;
const FORBIDDEN_ACTION =
  /(?:auto.?merge|auto.?approve|approve.?pull.?request|pull.?request.?approve)/i;
const APP_TOKEN_ACTION = /(?:^|\/)create-github-app-token$/i;
const EVENT_CONTROLLED_EXPRESSION = /\${{[^}]*\bgithub\.event\b[^}]*}}/i;
const DYNAMIC_EXPRESSION = /\${{/;

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

function hasEventControlledValue(value: unknown): boolean {
  if (typeof value === 'string') return EVENT_CONTROLLED_EXPRESSION.test(value);
  if (Array.isArray(value)) return value.some(hasEventControlledValue);
  const record = asRecord(value);
  return record ? Object.values(record).some(hasEventControlledValue) : false;
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

function hasWorkflowTrigger(value: unknown, trigger: string): boolean {
  if (value === trigger) return true;
  if (Array.isArray(value)) return value.includes(trigger);
  return Object.prototype.hasOwnProperty.call(asRecord(value) ?? {}, trigger);
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
  if (mergeCapable && hasEventControlledValue(entry.step.with)) {
    violations.push(`${entry.location}: merge-capable action inputs must not be event-controlled`);
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
  const secretNames = customSecretNames(step);
  return (
    filename === 'ci.yml' &&
    !mergeCapable &&
    step.uses === 'codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f' &&
    withConfig?.token === '${{ secrets.CODECOV_TOKEN }}' &&
    secretNames.length === 1 &&
    secretNames[0] === 'CODECOV_TOKEN'
  );
}

function customSecretNames(value: unknown): string[] {
  const names: string[] = [];
  forEachString(value, (text) => {
    for (const match of text.matchAll(/\bsecrets\.([A-Za-z0-9_]+)\b/g)) {
      if (match[1] !== 'GITHUB_TOKEN') names.push(match[1]);
    }
  });
  return names;
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
  const secretNames = customSecretNames(step);
  if (secretNames.includes('CODECOV_TOKEN') && !exactCodecov) {
    violations.push(
      `${location}: CODECOV_TOKEN is allowed only on the exact pinned Codecov action`
    );
    unbounded = true;
  }
  if (secretNames.length > 0 && !exactCodecov) {
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

function checkReleaseProfile(projectRoot: string, source: string, violations: string[]): boolean {
  let exact = createHash('sha256').update(source).digest('hex') === RELEASE_WORKFLOW_SHA256;

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

function checkDependabot(projectRoot: string, violations: string[]): void {
  const relativePath = '.github/dependabot.yml';
  try {
    const digest = createHash('sha256')
      .update(readFileSync(join(projectRoot, relativePath)))
      .digest('hex');
    if (digest !== DEPENDABOT_SHA256) {
      violations.push(`${relativePath}: exact Dependabot profile drifted`);
    }
  } catch (error) {
    violations.push(`${relativePath}: could not read exact Dependabot profile (${String(error)})`);
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

function checkWorkflow(
  projectRoot: string,
  filename: string,
  workflow: YamlRecord,
  source: string,
  provenance: Record<string, ActionProvenance>,
  usedProvenance: Set<string>,
  violations: string[]
): void {
  const relativePath = `.github/workflows/${filename}`;
  const jobs = asRecord(workflow.jobs);
  if (!jobs) {
    violations.push(`${relativePath}: jobs must be an object`);
    return;
  }

  const hasWorkflowPermissions = Object.prototype.hasOwnProperty.call(workflow, 'permissions');
  const workflowPermissions = hasWorkflowPermissions
    ? parsePermissions(workflow.permissions, `${relativePath}: workflow permissions`, violations)
    : undefined;
  const exactReleaseProfile =
    filename === 'publish.yml' ? checkReleaseProfile(projectRoot, source, violations) : false;
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
    const releaseException =
      filename === 'publish.yml' && jobId === 'github-release' && exactReleaseProfile;
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
    if (mergeCapable && !releaseException && hasEventControlledValue(workflow.env)) {
      violations.push(`${location}: merge-capable workflow env must not be event-controlled`);
    }
    if (mergeCapable && !releaseException && hasEventControlledValue(job.env)) {
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
        if (mergeCapable && !releaseException) {
          violations.push(`${stepLocation}: merge-capable jobs may not execute run steps`);
        }
      }
      if (mergeCapable && !releaseException && hasEventControlledValue(step.env)) {
        violations.push(`${stepLocation}: merge-capable step env must not be event-controlled`);
      }
    }
    for (const entry of entries) {
      checkAction(
        entry,
        provenance,
        usedProvenance,
        mergeCapable && !releaseException,
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
  checkDependabot(projectRoot, violations);
  return violations;
}
