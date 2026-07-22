import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

type YamlRecord = Record<string, unknown>;
type PermissionMap = Record<string, 'read' | 'write' | 'none'>;

interface ActionProvenance {
  sha: string;
  version: string;
}

interface UsesEntry {
  location: string;
  value: unknown;
  with?: YamlRecord;
}

interface UsesSourceEntry {
  comment?: string;
  value: unknown;
}

interface WorkflowPermissionPolicy {
  jobs?: Record<string, PermissionMap>;
  workflow?: PermissionMap;
}

const WORKFLOW_POLICIES: Record<string, WorkflowPermissionPolicy> = {
  'ci.yml': { workflow: { contents: 'read' } },
  'labeler.yml': { workflow: { 'pull-requests': 'write' } },
  'pr-lint.yml': { workflow: { 'pull-requests': 'read' } },
  'pr-size.yml': { workflow: { 'pull-requests': 'write' } },
  'publish.yml': {
    jobs: {
      publish: { contents: 'read', 'id-token': 'write' },
      'github-release': { contents: 'write' },
    },
  },
  'stale.yml': { workflow: { issues: 'write', 'pull-requests': 'write' } },
  'upstream-watch.yml': { workflow: { contents: 'read', issues: 'write' } },
  'welcome.yml': { workflow: { issues: 'write', 'pull-requests': 'write' } },
};

const REPOSITORY_EXECUTABLE_PATH =
  /^(?:["']?)((?:\.\/)?(?:\.github\/scripts|scripts|bin)\/[A-Za-z0-9_./-]+)(?:["']?)(?=\s|$)/;
const SCRIPT_INTERPRETER = /^(?:bash|sh|node|tsx|ts-node|python|python3|bun|ruby)\s+/;

const FORBIDDEN_EXECUTABLE_PATTERNS: Array<[RegExp, string]> = [
  [/\bgh\s+pr\s+merge\b/i, 'GitHub CLI pull request merge'],
  [/\bgh\s+pr\s+review\b[^\n]*(?:--approve|-a)\b/i, 'GitHub CLI pull request approval'],
  [/\b(?:github|octokit)\.rest\.pulls\.merge\s*\(/i, 'Octokit pull request merge mutation'],
  [
    /\b(?:github|octokit)\.rest\.pulls\.createReview\s*\([\s\S]{0,500}\bAPPROVE\b/i,
    'Octokit pull request approval mutation',
  ],
  [/\/pulls\/[^\s"'`]+\/merge\b/i, 'REST pull request merge endpoint'],
  [/\/pulls\/[^\s"'`]+\/reviews\b[\s\S]{0,500}\bAPPROVE\b/i, 'REST pull request approval endpoint'],
  [/\bmergePullRequest\b/i, 'GraphQL mergePullRequest mutation'],
  [/\benablePullRequestAutoMerge\b/i, 'GraphQL enablePullRequestAutoMerge mutation'],
  [/\baddPullRequestReview\b[\s\S]{0,500}\bAPPROVE\b/i, 'GraphQL pull request approval mutation'],
  [/\bpullRequests?\s*\.\s*merge\s*\(/i, 'pull request merge call'],
];

function asRecord(value: unknown): YamlRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as YamlRecord)
    : undefined;
}

function parseYaml(
  path: string,
  relativePath: string,
  violations: string[]
): YamlRecord | undefined {
  try {
    const parsed = asRecord(load(readFileSync(path, 'utf8')));
    if (!parsed) {
      violations.push(`${relativePath}: YAML document must be a mapping`);
    }
    return parsed;
  } catch (error) {
    violations.push(`${relativePath}: invalid YAML (${String(error)})`);
    return undefined;
  }
}

function sameStringSet(value: unknown, expected: string[]): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((item) => value.includes(item))
  );
}

function samePermissionMap(value: unknown, expected: PermissionMap): boolean {
  const actual = asRecord(value);
  if (!actual) {
    return false;
  }
  const actualKeys = Object.keys(actual).sort();
  const expectedKeys = Object.keys(expected).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index]) &&
    expectedKeys.every((key) => actual[key] === expected[key])
  );
}

function collectUsesEntries(workflow: YamlRecord, relativePath: string): UsesEntry[] {
  const entries: UsesEntry[] = [];
  const jobs = asRecord(workflow.jobs);
  if (!jobs) {
    return entries;
  }

  for (const [jobName, jobValue] of Object.entries(jobs)) {
    const job = asRecord(jobValue);
    if (!job) {
      continue;
    }
    if (job.uses !== undefined) {
      entries.push({ location: `${relativePath}:jobs.${jobName}.uses`, value: job.uses });
    }
    if (!Array.isArray(job.steps)) {
      continue;
    }
    job.steps.forEach((stepValue, index) => {
      const step = asRecord(stepValue);
      if (step?.uses !== undefined) {
        entries.push({
          location: `${relativePath}:jobs.${jobName}.steps[${index}].uses`,
          value: step.uses,
          with: asRecord(step.with),
        });
      }
    });
  }
  return entries;
}

function splitYamlComment(value: string): { comment?: string; scalar: string } {
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (inDoubleQuote && escaped) {
      escaped = false;
      continue;
    }
    if (inDoubleQuote && character === '\\') {
      escaped = true;
      continue;
    }
    if (!inSingleQuote && character === '"') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (!inDoubleQuote && character === "'") {
      if (inSingleQuote && value[index + 1] === "'") {
        index += 1;
      } else {
        inSingleQuote = !inSingleQuote;
      }
      continue;
    }
    if (
      character === '#' &&
      !inDoubleQuote &&
      !inSingleQuote &&
      (index === 0 || /\s/.test(value[index - 1]))
    ) {
      return {
        comment: value.slice(index + 1).trim(),
        scalar: value.slice(0, index).trim(),
      };
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
  for (const [index, line] of source.split('\n').entries()) {
    const match = line.match(/^\s*(?:-\s*)?uses\s*:\s*(.*)$/);
    if (!match) {
      continue;
    }
    const { comment, scalar } = splitYamlComment(match[1]);
    try {
      const parsed = asRecord(load(`value: ${scalar}`));
      entries.push({ comment, value: parsed?.value });
    } catch (error) {
      violations.push(
        `${relativePath}:${index + 1}: could not parse uses scalar (${String(error)})`
      );
    }
  }
  return entries;
}

function isExactSemverComment(value: string | undefined): boolean {
  return Boolean(
    value &&
    /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(
      value
    )
  );
}

function checkActionReference(
  entry: UsesEntry,
  comment: string | undefined,
  provenance: Record<string, ActionProvenance>,
  usedProvenance: Set<string>,
  violations: string[]
): void {
  if (typeof entry.value !== 'string') {
    violations.push(`${entry.location}: uses must be a string`);
    return;
  }
  const actionRef = entry.value;
  if (actionRef.startsWith('./')) {
    return;
  }
  if (actionRef.startsWith('docker://')) {
    if (!/^docker:\/\/[^\s@]+@sha256:[0-9a-f]{64}$/.test(actionRef)) {
      violations.push(`${entry.location}: Docker action must be pinned by sha256 digest`);
    }
    return;
  }

  const separator = actionRef.lastIndexOf('@');
  const actionId = separator >= 0 ? actionRef.slice(0, separator) : actionRef;
  const ref = separator >= 0 ? actionRef.slice(separator + 1) : '';
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    violations.push(
      `${entry.location}: external action is not pinned to a 40-character commit: ${actionRef}`
    );
  }
  if (!isExactSemverComment(comment)) {
    violations.push(
      `${entry.location}: external action must have one exact semver release comment`
    );
  }
  if (
    /(?:^|[-_/])(?:auto-?merge|merge-pull-request|pull-request-merge)(?:$|[-_/])/i.test(actionId)
  ) {
    violations.push(`${entry.location}: forbidden merge action: ${actionId}`);
  }

  const expected = provenance[actionId];
  if (!expected) {
    violations.push(`${entry.location}: ${actionId} is missing from action provenance`);
  } else {
    usedProvenance.add(actionId);
    if (expected.sha !== ref || expected.version !== comment) {
      violations.push(`${entry.location}: action ref or release comment does not match provenance`);
    }
  }

  if (actionId === 'actions/checkout' && entry.with?.['persist-credentials'] !== false) {
    violations.push(`${entry.location}: actions/checkout persist-credentials must be false`);
  }
}

function checkActionPins(
  workflow: YamlRecord,
  source: string,
  relativePath: string,
  provenance: Record<string, ActionProvenance>,
  usedProvenance: Set<string>,
  violations: string[]
): void {
  const parsedEntries = collectUsesEntries(workflow, relativePath);
  const sourceEntries = collectUsesSourceEntries(source, relativePath, violations);
  if (parsedEntries.length !== sourceEntries.length) {
    violations.push(
      `${relativePath}: every parsed uses entry must have unambiguous source metadata`
    );
  }

  parsedEntries.forEach((entry, index) => {
    const sourceEntry = sourceEntries[index];
    const comment = sourceEntry?.value === entry.value ? sourceEntry.comment : undefined;
    if (sourceEntry && sourceEntry.value !== entry.value) {
      violations.push(`${entry.location}: parsed uses value does not match source metadata`);
    }
    checkActionReference(entry, comment, provenance, usedProvenance, violations);
  });
}

function checkWorkflowPermissions(
  filename: string,
  workflow: YamlRecord,
  violations: string[]
): void {
  const relativePath = `.github/workflows/${filename}`;
  const policy = WORKFLOW_POLICIES[filename];
  if (!policy) {
    violations.push(`${relativePath}: workflow is not explicitly classified`);
    return;
  }

  const jobs = asRecord(workflow.jobs);
  if (!jobs) {
    violations.push(`${relativePath}: jobs must be a mapping`);
    return;
  }

  if (policy.workflow) {
    if (!samePermissionMap(workflow.permissions, policy.workflow)) {
      violations.push(`${relativePath}: workflow permissions do not match the allowed map`);
    }
    for (const [jobName, jobValue] of Object.entries(jobs)) {
      if (asRecord(jobValue)?.permissions !== undefined) {
        violations.push(
          `${relativePath}:jobs.${jobName}: job permissions override is not explicitly allowed`
        );
      }
    }
    return;
  }

  if (workflow.permissions !== undefined) {
    violations.push(`${relativePath}: workflow-level permissions are not allowed`);
  }
  const expectedJobs = policy.jobs ?? {};
  for (const expectedJob of Object.keys(expectedJobs)) {
    if (!(expectedJob in jobs)) {
      violations.push(
        `${relativePath}: required permission-classified job is missing: ${expectedJob}`
      );
    }
  }
  for (const [jobName, jobValue] of Object.entries(jobs)) {
    const expected = expectedJobs[jobName];
    if (!expected) {
      violations.push(
        `${relativePath}:jobs.${jobName}: job is not explicitly permission-classified`
      );
      continue;
    }
    if (!samePermissionMap(asRecord(jobValue)?.permissions, expected)) {
      violations.push(`${relativePath}:jobs.${jobName}: permissions do not match the allowed map`);
    }
  }
}

function executableSource(source: string): string {
  return source
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n');
}

function checkMergeMutations(relativePath: string, source: string, violations: string[]): void {
  const executable = executableSource(source);
  for (const [pattern, description] of FORBIDDEN_EXECUTABLE_PATTERNS) {
    if (pattern.test(executable)) {
      violations.push(`${relativePath}: forbidden merge or approval path found (${description})`);
    }
  }
}

function collectRunBlocks(workflow: YamlRecord): string[] {
  const runs: string[] = [];
  const jobs = asRecord(workflow.jobs);
  if (!jobs) {
    return runs;
  }
  for (const jobValue of Object.values(jobs)) {
    const job = asRecord(jobValue);
    if (!Array.isArray(job?.steps)) {
      continue;
    }
    for (const stepValue of job.steps) {
      const run = asRecord(stepValue)?.run;
      if (typeof run === 'string') {
        runs.push(run);
      }
    }
  }
  return runs;
}

function collectInvokedExecutablePaths(source: string): string[] {
  const paths: string[] = [];

  for (const sourceLine of source.split('\n')) {
    const line = sourceLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith('*')) {
      continue;
    }

    for (const shellSegment of line.split(/\s*(?:&&|\|\||;|\|)\s*/)) {
      let command = shellSegment
        .trim()
        .replace(/^(?:exec\s+)?(?:env\s+)?/, '')
        .replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)*/, '');
      command = command.replace(SCRIPT_INTERPRETER, '');
      const match = command.match(REPOSITORY_EXECUTABLE_PATH);
      if (match) {
        paths.push(match[1].replace(/^\.\//, ''));
      }
    }
  }
  return paths;
}

function checkDelegatedScripts(
  projectRoot: string,
  workflowRuns: Array<{ relativePath: string; source: string }>,
  violations: string[]
): void {
  const packagePath = join(projectRoot, 'package.json');
  const packageJson = existsSync(packagePath)
    ? asRecord(JSON.parse(readFileSync(packagePath, 'utf8')))
    : undefined;
  const scripts = asRecord(packageJson?.scripts) ?? {};
  const sources = [
    ...workflowRuns,
    ...Object.entries(scripts)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .map(([name, source]) => ({ relativePath: `package.json#scripts.${name}`, source })),
  ];
  const queuedPaths = sources.flatMap(({ source }) => collectInvokedExecutablePaths(source));
  const scannedPaths = new Set<string>();

  for (const { relativePath, source } of sources) {
    checkMergeMutations(relativePath, source, violations);
  }

  while (queuedPaths.length > 0) {
    const candidate = queuedPaths.shift();
    if (!candidate || scannedPaths.has(candidate)) {
      continue;
    }
    scannedPaths.add(candidate);
    const absolutePath = join(projectRoot, candidate);
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      violations.push(`${candidate}: referenced repository-owned executable does not exist`);
      continue;
    }
    const source = readFileSync(absolutePath, 'utf8');
    checkMergeMutations(candidate, source, violations);
    queuedPaths.push(...collectInvokedExecutablePaths(source));
  }
}

function exactGroup(groups: YamlRecord | undefined, name: string, dependencyType: string): boolean {
  const group = asRecord(groups?.[name]);
  return Boolean(
    group &&
    Object.keys(group).length === 2 &&
    group['dependency-type'] === dependencyType &&
    sameStringSet(group['update-types'], ['minor', 'patch'])
  );
}

function checkDependabot(projectRoot: string, violations: string[]): void {
  const relativePath = '.github/dependabot.yml';
  const path = join(projectRoot, relativePath);
  const config = parseYaml(path, relativePath, violations);
  const updates = config?.updates;
  if (!Array.isArray(updates)) {
    violations.push(`${relativePath}: updates must be an array`);
    return;
  }

  const npmUpdates = updates.filter((entry) => asRecord(entry)?.['package-ecosystem'] === 'npm');
  const actionsUpdates = updates.filter(
    (entry) => asRecord(entry)?.['package-ecosystem'] === 'github-actions'
  );
  if (npmUpdates.length !== 1) {
    violations.push(`${relativePath}: expected exactly one npm update configuration`);
  } else {
    const npmConfig = asRecord(npmUpdates[0]);
    const ignore = npmConfig?.ignore;
    const groups = asRecord(npmConfig?.groups);
    const majorIgnore =
      Array.isArray(ignore) &&
      ignore.length === 1 &&
      asRecord(ignore[0])?.['dependency-name'] === '*' &&
      sameStringSet(asRecord(ignore[0])?.['update-types'], ['version-update:semver-major']);
    if (!majorIgnore) {
      violations.push(`${relativePath}: npm major-version ignore policy must remain exact`);
    }
    if (
      !groups ||
      Object.keys(groups).length !== 2 ||
      !exactGroup(groups, 'dev-dependencies', 'development') ||
      !exactGroup(groups, 'production-dependencies', 'production')
    ) {
      violations.push(`${relativePath}: npm production/development grouping must remain exact`);
    }
  }

  if (actionsUpdates.length !== 1) {
    violations.push(`${relativePath}: expected exactly one github-actions update configuration`);
    return;
  }
  const actionsConfig = asRecord(actionsUpdates[0]);
  const schedule = asRecord(actionsConfig?.schedule);
  const cooldown = asRecord(actionsConfig?.cooldown);
  const groups = asRecord(actionsConfig?.groups);
  const actionGroup = asRecord(groups?.['github-actions']);
  if (schedule?.timezone !== 'America/Los_Angeles') {
    violations.push(`${relativePath}: github-actions timezone must be America/Los_Angeles`);
  }
  if (cooldown?.['default-days'] !== 14) {
    violations.push(`${relativePath}: github-actions cooldown.default-days must be 14`);
  }
  if (
    !groups ||
    Object.keys(groups).length !== 1 ||
    !actionGroup ||
    Object.keys(actionGroup).length !== 2 ||
    !sameStringSet(actionGroup.patterns, ['*']) ||
    !sameStringSet(actionGroup['update-types'], ['minor', 'patch'])
  ) {
    violations.push(
      `${relativePath}: github-actions grouping must remain limited to minor and patch`
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
    if (!parsed) {
      violations.push(`${relativePath}: provenance must be an object`);
      return {};
    }
    const provenance: Record<string, ActionProvenance> = {};
    for (const [actionId, value] of Object.entries(parsed)) {
      const record = asRecord(value);
      if (
        !record ||
        Object.keys(record).length !== 2 ||
        typeof record.sha !== 'string' ||
        !/^[0-9a-f]{40}$/.test(record.sha) ||
        typeof record.version !== 'string' ||
        !isExactSemverComment(record.version)
      ) {
        violations.push(`${relativePath}: invalid provenance entry for ${actionId}`);
        continue;
      }
      provenance[actionId] = { sha: record.sha, version: record.version };
    }
    return provenance;
  } catch (error) {
    violations.push(`${relativePath}: could not read provenance (${String(error)})`);
    return {};
  }
}

export function checkGitHubActionsSecurity(projectRoot: string): string[] {
  const violations: string[] = [];
  const workflowsDir = join(projectRoot, '.github', 'workflows');
  const provenance = readProvenance(projectRoot, violations);
  const usedProvenance = new Set<string>();
  const workflowRuns: Array<{ relativePath: string; source: string }> = [];
  const workflowFiles = readdirSync(workflowsDir)
    .filter((name) => /\.ya?ml$/.test(name))
    .sort();

  for (const requiredWorkflow of Object.keys(WORKFLOW_POLICIES)) {
    if (!workflowFiles.includes(requiredWorkflow)) {
      violations.push(`.github/workflows/${requiredWorkflow}: classified workflow is missing`);
    }
  }

  for (const filename of workflowFiles) {
    const relativePath = `.github/workflows/${filename}`;
    const path = join(workflowsDir, filename);
    const source = readFileSync(path, 'utf8');
    const workflow = parseYaml(path, relativePath, violations);
    if (!workflow) {
      continue;
    }

    checkWorkflowPermissions(filename, workflow, violations);
    checkActionPins(workflow, source, relativePath, provenance, usedProvenance, violations);
    for (const run of collectRunBlocks(workflow)) {
      checkMergeMutations(relativePath, run, violations);
      workflowRuns.push({ relativePath, source: run });
    }
  }

  for (const actionId of Object.keys(provenance)) {
    if (!usedProvenance.has(actionId)) {
      violations.push(`scripts/check/github-actions-provenance.json: unused entry for ${actionId}`);
    }
  }

  checkDelegatedScripts(projectRoot, workflowRuns, violations);
  checkDependabot(projectRoot, violations);

  return violations;
}
