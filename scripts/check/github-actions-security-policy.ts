import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';
import { load } from 'js-yaml';
import ts from 'typescript';

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

interface CommandSource {
  cwd: string;
  relativePath: string;
  source: string;
}

interface ActionCheckContext {
  checkedLocalActions: Set<string>;
  commandSources: CommandSource[];
  localActionStack: string[];
  projectRoot: string;
  provenance: Record<string, ActionProvenance>;
  usedProvenance: Set<string>;
  violations: string[];
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

const SCRIPT_INTERPRETER = /^(?:bash|sh|node|tsx|ts-node|python|python3|bun|ruby)\b/;
const REPOSITORY_PATH_PREFIX = /^(?:\.\.?\/|\.github\/scripts\/|scripts\/|bin\/)/;

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
  let blockScalarIndent: number | undefined;
  for (const [index, line] of source.split('\n').entries()) {
    const indentation = line.match(/^ */)?.[0].length ?? 0;
    if (blockScalarIndent !== undefined) {
      if (!line.trim() || indentation > blockScalarIndent) {
        continue;
      }
      blockScalarIndent = undefined;
    }

    if (/^\s*(?:-\s*)?[A-Za-z0-9_-]+\s*:\s*[>|](?:[+-][1-9]?|[1-9][+-]?|)\s*(?:#.*)?$/.test(line)) {
      blockScalarIndent = indentation;
      continue;
    }

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

function isWithinDirectory(parent: string, candidate: string): boolean {
  const pathFromParent = relative(parent, candidate);
  return (
    pathFromParent === '' ||
    (pathFromParent !== '..' &&
      !pathFromParent.startsWith('../') &&
      !pathFromParent.startsWith('/'))
  );
}

function collectCompositeUsesEntries(manifest: YamlRecord, relativePath: string): UsesEntry[] {
  const runs = asRecord(manifest.runs);
  if (runs?.using !== 'composite' || !Array.isArray(runs.steps)) {
    return [];
  }

  const entries: UsesEntry[] = [];
  runs.steps.forEach((stepValue, index) => {
    const step = asRecord(stepValue);
    if (step?.uses !== undefined) {
      entries.push({
        location: `${relativePath}:runs.steps[${index}].uses`,
        value: step.uses,
        with: asRecord(step.with),
      });
    }
  });
  return entries;
}

function checkUsesEntries(
  entries: UsesEntry[],
  source: string,
  relativePath: string,
  context: ActionCheckContext
): void {
  const sourceEntries = collectUsesSourceEntries(source, relativePath, context.violations);
  if (entries.length !== sourceEntries.length) {
    context.violations.push(
      `${relativePath}: every parsed uses entry must have unambiguous source metadata`
    );
  }

  entries.forEach((entry, index) => {
    const sourceEntry = sourceEntries[index];
    const comment = sourceEntry?.value === entry.value ? sourceEntry.comment : undefined;
    if (sourceEntry && sourceEntry.value !== entry.value) {
      context.violations.push(
        `${entry.location}: parsed uses value does not match source metadata`
      );
    }
    checkActionReference(entry, comment, context);
  });
}

function checkLocalAction(entry: UsesEntry, actionRef: string, context: ActionCheckContext): void {
  const lexicalDirectory = resolve(context.projectRoot, actionRef);
  if (!isWithinDirectory(context.projectRoot, lexicalDirectory)) {
    context.violations.push(`${entry.location}: local action escapes the repository: ${actionRef}`);
    return;
  }
  if (!existsSync(lexicalDirectory) || !statSync(lexicalDirectory).isDirectory()) {
    context.violations.push(
      `${entry.location}: local action directory does not exist: ${actionRef}`
    );
    return;
  }

  const realRoot = realpathSync(context.projectRoot);
  const actionDirectory = realpathSync(lexicalDirectory);
  if (!isWithinDirectory(realRoot, actionDirectory)) {
    context.violations.push(`${entry.location}: local action resolves outside the repository`);
    return;
  }

  const manifests = ['action.yml', 'action.yaml']
    .map((name) => join(actionDirectory, name))
    .filter((path) => existsSync(path) && statSync(path).isFile());
  if (manifests.length !== 1) {
    context.violations.push(
      `${entry.location}: local action must contain exactly one action.yml or action.yaml`
    );
    return;
  }

  const manifestPath = realpathSync(manifests[0]);
  if (!isWithinDirectory(realRoot, manifestPath)) {
    context.violations.push(
      `${entry.location}: local action manifest resolves outside the repository`
    );
    return;
  }
  const manifestRelativePath = relative(realRoot, manifestPath);
  if (context.localActionStack.includes(manifestRelativePath)) {
    context.violations.push(
      `${entry.location}: local action cycle detected: ${[
        ...context.localActionStack,
        manifestRelativePath,
      ].join(' -> ')}`
    );
    return;
  }
  if (context.checkedLocalActions.has(manifestRelativePath)) {
    return;
  }

  context.localActionStack.push(manifestRelativePath);
  const manifest = parseYaml(manifestPath, manifestRelativePath, context.violations);
  if (manifest) {
    const runs = asRecord(manifest.runs);
    if (runs?.using === 'composite') {
      if (!Array.isArray(runs.steps)) {
        context.violations.push(`${manifestRelativePath}: composite action steps must be an array`);
      } else {
        const source = readFileSync(manifestPath, 'utf8');
        checkUsesEntries(
          collectCompositeUsesEntries(manifest, manifestRelativePath),
          source,
          manifestRelativePath,
          context
        );
        for (const stepValue of runs.steps) {
          const step = asRecord(stepValue);
          if (typeof step?.run === 'string') {
            const workingDirectory =
              typeof step['working-directory'] === 'string'
                ? resolve(context.projectRoot, step['working-directory'])
                : context.projectRoot;
            context.commandSources.push({
              cwd: workingDirectory,
              relativePath: manifestRelativePath,
              source: step.run,
            });
          }
        }
      }
    } else {
      context.violations.push(
        `${manifestRelativePath}: non-composite local actions are not allowed by policy`
      );
    }
  }
  context.localActionStack.pop();
  context.checkedLocalActions.add(manifestRelativePath);
}

function checkActionReference(
  entry: UsesEntry,
  comment: string | undefined,
  context: ActionCheckContext
): void {
  if (typeof entry.value !== 'string') {
    context.violations.push(`${entry.location}: uses must be a string`);
    return;
  }
  const actionRef = entry.value;
  if (actionRef.startsWith('./')) {
    checkLocalAction(entry, actionRef, context);
    return;
  }
  if (actionRef.startsWith('docker://')) {
    if (!/^docker:\/\/[^\s@]+@sha256:[0-9a-f]{64}$/.test(actionRef)) {
      context.violations.push(`${entry.location}: Docker action must be pinned by sha256 digest`);
    }
    return;
  }

  const separator = actionRef.lastIndexOf('@');
  const actionId = separator >= 0 ? actionRef.slice(0, separator) : actionRef;
  const ref = separator >= 0 ? actionRef.slice(separator + 1) : '';
  if (!/^[0-9a-f]{40}$/.test(ref)) {
    context.violations.push(
      `${entry.location}: external action is not pinned to a 40-character commit: ${actionRef}`
    );
  }
  if (!isExactSemverComment(comment)) {
    context.violations.push(
      `${entry.location}: external action must have one exact semver release comment`
    );
  }
  if (
    /(?:^|[-_/])(?:auto-?merge|merge-pull-request|pull-request-merge)(?:$|[-_/])/i.test(actionId)
  ) {
    context.violations.push(`${entry.location}: forbidden merge action: ${actionId}`);
  }
  if (
    /(?:^|[-_/])(?:auto-?approve|approve-pull-request|pull-request-approve)(?:$|[-_/])/i.test(
      actionId
    )
  ) {
    context.violations.push(`${entry.location}: forbidden approval action: ${actionId}`);
  }

  const expected = context.provenance[actionId];
  if (!expected) {
    context.violations.push(`${entry.location}: ${actionId} is missing from action provenance`);
  } else {
    context.usedProvenance.add(actionId);
    if (expected.sha !== ref || expected.version !== comment) {
      context.violations.push(
        `${entry.location}: action ref or release comment does not match provenance`
      );
    }
  }

  if (actionId === 'actions/checkout' && entry.with?.['persist-credentials'] !== false) {
    context.violations.push(
      `${entry.location}: actions/checkout persist-credentials must be false`
    );
  }
}

function checkActionPins(
  workflow: YamlRecord,
  source: string,
  relativePath: string,
  context: ActionCheckContext
): void {
  checkUsesEntries(collectUsesEntries(workflow, relativePath), source, relativePath, context);
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

function stripJavaScriptComments(source: string, relativePath: string): string {
  const scriptKind = relativePath.endsWith('x')
    ? relativePath.includes('.ts')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.JSX
    : relativePath.includes('.ts')
      ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );
  const ranges = new Map<string, ts.CommentRange>();
  const collectRanges = (commentRanges: ts.CommentRange[] | undefined): void => {
    for (const range of commentRanges ?? []) {
      ranges.set(`${range.pos}:${range.end}`, range);
    }
  };
  const visit = (node: ts.Node): void => {
    collectRanges(ts.getLeadingCommentRanges(source, node.pos));
    collectRanges(ts.getTrailingCommentRanges(source, node.end));
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  const characters = source.split('');
  for (const range of ranges.values()) {
    for (let index = range.pos; index < range.end; index += 1) {
      if (characters[index] !== '\n' && characters[index] !== '\r') {
        characters[index] = ' ';
      }
    }
  }
  return characters.join('');
}

function executableSource(relativePath: string, source: string): string {
  const withoutJavaScriptComments = /\.(?:[cm]?[jt]sx?)$/.test(relativePath)
    ? stripJavaScriptComments(source, relativePath)
    : source;
  return withoutJavaScriptComments
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n')
    .replace(/\$\{\{[\s\S]*?\}\}/g, '__GITHUB_EXPRESSION__');
}

function checkMergeMutations(relativePath: string, source: string, violations: string[]): void {
  const executable = executableSource(relativePath, source);
  for (const [pattern, description] of FORBIDDEN_EXECUTABLE_PATTERNS) {
    if (pattern.test(executable)) {
      violations.push(`${relativePath}: forbidden merge or approval path found (${description})`);
    }
  }
}

function collectRunBlocks(
  workflow: YamlRecord,
  projectRoot: string,
  relativePath: string
): CommandSource[] {
  const runs: CommandSource[] = [];
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
      const step = asRecord(stepValue);
      const run = step?.run;
      if (typeof run === 'string') {
        runs.push({
          cwd:
            typeof step?.['working-directory'] === 'string'
              ? resolve(projectRoot, step['working-directory'])
              : projectRoot,
          relativePath,
          source: run,
        });
      }
    }
  }
  return runs;
}

function shellWords(source: string): string[] {
  const words: string[] = [];
  for (const match of source.matchAll(/"([^"]*)"|'([^']*)'|([^\s]+)/g)) {
    words.push(match[1] ?? match[2] ?? match[3]);
  }
  return words;
}

function unwrapEnvironmentCommand(
  words: string[],
  violations: string[],
  location: string
): string[] {
  if (!['env', '/usr/bin/env'].includes(words[0])) {
    return words;
  }

  let index = 1;
  while (index < words.length) {
    const word = words[index];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
      index += 1;
    } else if (['-i', '--ignore-environment', '-0', '--null'].includes(word)) {
      index += 1;
    } else if (['-u', '--unset', '-C', '--chdir'].includes(word)) {
      if (index + 1 >= words.length) {
        violations.push(`${location}: cannot resolve env option operand: ${word}`);
        return [];
      }
      index += 2;
    } else if (/^(?:--unset|--chdir)=/.test(word) || /^-(?:u|C).+/.test(word)) {
      index += 1;
    } else if (word === '--') {
      index += 1;
      break;
    } else if (word.startsWith('-')) {
      violations.push(`${location}: cannot resolve env option: ${word}`);
      return [];
    } else {
      break;
    }
  }
  if (index >= words.length) {
    violations.push(`${location}: env invocation does not identify a command`);
    return [];
  }
  return words.slice(index);
}

function packageManagerCommandIndex(
  manager: string,
  words: string[],
  currentDirectory: string,
  projectRoot: string,
  violations: string[],
  location: string
): number | undefined {
  const noOperandOptions = new Set([
    '-s',
    '--silent',
    '--verbose',
    '--json',
    '--offline',
    '--color',
    '--no-color',
  ]);
  const directoryOptions: Record<string, Set<string>> = {
    npm: new Set(['--prefix']),
    pnpm: new Set(['--dir', '-C']),
    yarn: new Set(['--cwd']),
  };
  let index = 1;
  while (index < words.length && words[index].startsWith('-')) {
    const word = words[index];
    const separator = word.indexOf('=');
    const option = separator >= 0 ? word.slice(0, separator) : word;
    if (noOperandOptions.has(option)) {
      index += 1;
      continue;
    }
    if (directoryOptions[manager].has(option)) {
      const operand = separator >= 0 ? word.slice(separator + 1) : words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve package-manager option operand: ${option}`);
        return undefined;
      }
      if (resolve(currentDirectory, operand) !== projectRoot) {
        violations.push(
          `${location}: package-manager directory must resolve to the repository root: ${operand}`
        );
        return undefined;
      }
      index += separator >= 0 ? 1 : 2;
      continue;
    }
    violations.push(`${location}: cannot resolve package-manager option: ${word}`);
    return undefined;
  }
  return index;
}

function packageScriptTargets(
  words: string[],
  scripts: YamlRecord,
  currentDirectory: string,
  projectRoot: string,
  violations: string[],
  location: string
): string[] {
  const targets: string[] = [];
  const manager = words[0];
  let directTarget: string | undefined;
  if (['npm', 'pnpm', 'yarn'].includes(manager)) {
    const commandIndex = packageManagerCommandIndex(
      manager,
      words,
      currentDirectory,
      projectRoot,
      violations,
      location
    );
    if (commandIndex === undefined) {
      return targets;
    }
    const command = words[commandIndex];
    if (command === 'run') {
      directTarget = words[commandIndex + 1];
      if (!directTarget) {
        violations.push(`${location}: package-manager run command is missing a script target`);
        return targets;
      }
    } else if (manager === 'npm' && ['test', 'start', 'stop', 'restart'].includes(command)) {
      directTarget = command;
    } else if ((manager === 'yarn' || manager === 'pnpm') && typeof scripts[command] === 'string') {
      directTarget = command;
    }
  }
  if (directTarget) {
    if (typeof scripts[directTarget] === 'string') {
      targets.push(directTarget);
    } else {
      violations.push(`${location}: referenced package script does not exist: ${directTarget}`);
    }
  }

  if (['npm-run-all', 'run-s', 'run-p'].includes(words[0])) {
    const patterns = words.slice(1).filter((word) => !word.startsWith('-'));
    for (const pattern of patterns) {
      const matcher = new RegExp(
        `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`
      );
      const matches = Object.keys(scripts).filter(
        (name) => typeof scripts[name] === 'string' && matcher.test(name)
      );
      if (matches.length === 0) {
        violations.push(`${location}: package-script pattern matched nothing: ${pattern}`);
      }
      targets.push(...matches);
    }
  }
  return targets;
}

function firstShellWord(source: string): string | undefined {
  return shellWords(source)[0];
}

function addRepositoryOperand(paths: string[], operand: string | undefined): void {
  if (operand && REPOSITORY_PATH_PREFIX.test(operand)) {
    paths.push(operand);
  }
}

function nodeExecutableOperands(words: string[], violations: string[], location: string): string[] {
  const paths: string[] = [];
  const executableOperandOptions = new Set([
    '-r',
    '--require',
    '--import',
    '--loader',
    '--experimental-loader',
  ]);
  const codeOperandOptions = new Set(['-e', '--eval', '-p', '--print']);
  const valueOptions = new Set([
    '--conditions',
    '--input-type',
    '--test-name-pattern',
    '--test-reporter',
  ]);
  const noOperandOptions = new Set([
    '-c',
    '--check',
    '--test',
    '--watch',
    '--inspect',
    '--inspect-brk',
    '--enable-source-maps',
    '--no-warnings',
    '--trace-warnings',
    '--use-strict',
  ]);
  let index = 1;
  let hasInlineCode = false;
  while (index < words.length && words[index].startsWith('-')) {
    const word = words[index];
    if (word === '--') {
      index += 1;
      break;
    }
    const separator = word.indexOf('=');
    const option = separator >= 0 ? word.slice(0, separator) : word;
    if (executableOperandOptions.has(option)) {
      const operand = separator >= 0 ? word.slice(separator + 1) : words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${option}`);
        return paths;
      }
      addRepositoryOperand(paths, operand);
      index += separator >= 0 ? 1 : 2;
    } else if (/^-r.+/.test(word)) {
      addRepositoryOperand(paths, word.slice(2));
      index += 1;
    } else if (codeOperandOptions.has(option)) {
      if (separator < 0 && index + 1 >= words.length) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${option}`);
        return paths;
      }
      hasInlineCode = true;
      index += separator >= 0 ? 1 : 2;
    } else if (/^-(?:e|p).+/.test(word)) {
      hasInlineCode = true;
      index += 1;
    } else if (valueOptions.has(option)) {
      if (separator < 0 && index + 1 >= words.length) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${option}`);
        return paths;
      }
      index += separator >= 0 ? 1 : 2;
    } else if (noOperandOptions.has(option) || /^--(?:no|trace)-/.test(option)) {
      index += 1;
    } else {
      violations.push(`${location}: cannot resolve interpreter option: ${word}`);
      return paths;
    }
  }
  addRepositoryOperand(paths, words[index]);
  if (index >= words.length && !hasInlineCode) {
    violations.push(`${location}: interpreter invocation does not identify an entrypoint`);
  }
  return paths;
}

function genericInterpreterOperands(
  interpreter: string,
  words: string[],
  violations: string[],
  location: string
): string[] {
  const paths: string[] = [];
  let index = 1;
  while (index < words.length && words[index].startsWith('-')) {
    const word = words[index];
    if (word === '--') {
      index += 1;
      break;
    }
    if ((interpreter === 'bash' || interpreter === 'sh') && /^-[A-Za-z]+$/.test(word)) {
      index += 1;
    } else if (['--noprofile', '--norc', '--posix'].includes(word)) {
      index += 1;
    } else if (['-r', '--require'].includes(word)) {
      const operand = words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${word}`);
        return paths;
      }
      addRepositoryOperand(paths, operand);
      index += 2;
    } else {
      violations.push(`${location}: cannot resolve interpreter option: ${word}`);
      return paths;
    }
  }
  addRepositoryOperand(paths, words[index]);
  if (index >= words.length) {
    violations.push(`${location}: interpreter invocation does not identify an entrypoint`);
  }
  return paths;
}

function invokedExecutables(words: string[], violations: string[], location: string): string[] {
  const commandName = words[0]?.split('/').pop();
  if (commandName === 'node') {
    return nodeExecutableOperands(words, violations, location);
  }
  if (commandName && SCRIPT_INTERPRETER.test(commandName)) {
    return genericInterpreterOperands(commandName, words, violations, location);
  }
  if (words[0] === '.' || words[0] === 'source') {
    if (!words[1]) {
      violations.push(`${location}: source invocation does not identify a script`);
      return [];
    }
    return REPOSITORY_PATH_PREFIX.test(words[1]) ? [words[1]] : [];
  }
  return words[0] && REPOSITORY_PATH_PREFIX.test(words[0]) ? [words[0]] : [];
}

function stripCommandPreamble(command: string): string {
  return command
    .trim()
    .replace(/^(?:exec\s+)?/, '')
    .replace(/^(?:[A-Za-z_][A-Za-z0-9_]*=(?:"[^"]*"|'[^']*'|\S+)\s+)*/, '');
}

function lifecycleScripts(target: string, scripts: YamlRecord): string[] {
  return [`pre${target}`, target, `post${target}`].filter(
    (name) => typeof scripts[name] === 'string'
  );
}

function checkDelegatedScripts(
  projectRoot: string,
  initialSources: CommandSource[],
  violations: string[]
): void {
  const packagePath = join(projectRoot, 'package.json');
  const packageJson = existsSync(packagePath)
    ? asRecord(JSON.parse(readFileSync(packagePath, 'utf8')))
    : undefined;
  const scripts = asRecord(packageJson?.scripts) ?? {};
  const sourceQueue = [...initialSources];
  const packageQueue: string[] = [];
  const executableQueue: Array<{ cwd: string; path: string }> = [];
  const scannedPackageScripts = new Set<string>();
  const scannedExecutables = new Set<string>();
  const realRoot = realpathSync(projectRoot);

  while (sourceQueue.length > 0 || packageQueue.length > 0 || executableQueue.length > 0) {
    const commandSource = sourceQueue.shift();
    if (commandSource) {
      checkMergeMutations(commandSource.relativePath, commandSource.source, violations);
      let currentDirectory = commandSource.cwd;
      const executable = executableSource(commandSource.relativePath, commandSource.source);
      for (const sourceLine of executable.split('\n')) {
        const line = sourceLine.trim();
        if (!line) {
          continue;
        }
        for (const rawSegment of line.split(/\s*(?:&&|\|\||;|\|)\s*/)) {
          const command = stripCommandPreamble(rawSegment);
          const cdTarget = command.match(/^cd\s+(.+)$/);
          if (cdTarget) {
            const directory = firstShellWord(cdTarget[1]);
            if (directory) {
              currentDirectory = resolve(currentDirectory, directory);
            }
            continue;
          }
          const words = unwrapEnvironmentCommand(
            shellWords(command),
            violations,
            commandSource.relativePath
          );
          if (words.length === 0) {
            continue;
          }
          for (const target of packageScriptTargets(
            words,
            scripts,
            currentDirectory,
            projectRoot,
            violations,
            commandSource.relativePath
          )) {
            packageQueue.push(...lifecycleScripts(target, scripts));
          }
          for (const path of invokedExecutables(words, violations, commandSource.relativePath)) {
            executableQueue.push({ cwd: currentDirectory, path });
          }
        }
      }
      continue;
    }

    const packageScript = packageQueue.shift();
    if (packageScript) {
      if (scannedPackageScripts.has(packageScript)) {
        continue;
      }
      scannedPackageScripts.add(packageScript);
      const source = scripts[packageScript];
      if (typeof source === 'string') {
        sourceQueue.push({
          cwd: projectRoot,
          relativePath: `package.json#scripts.${packageScript}`,
          source,
        });
      }
      continue;
    }

    const executableReference = executableQueue.shift();
    if (!executableReference) {
      continue;
    }
    const absolutePath = resolve(executableReference.cwd, executableReference.path);
    if (!isWithinDirectory(projectRoot, absolutePath)) {
      continue;
    }
    const displayPath = relative(projectRoot, absolutePath);
    const scanKey = `${absolutePath}\0${executableReference.cwd}`;
    if (scannedExecutables.has(scanKey)) {
      continue;
    }
    scannedExecutables.add(scanKey);
    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      violations.push(`${displayPath}: referenced repository-owned executable does not exist`);
      continue;
    }
    const realPath = realpathSync(absolutePath);
    if (!isWithinDirectory(realRoot, realPath)) {
      violations.push(
        `${displayPath}: repository-owned executable resolves outside the repository`
      );
      continue;
    }
    const source = readFileSync(absolutePath, 'utf8');
    sourceQueue.push({
      cwd: executableReference.cwd,
      relativePath: displayPath,
      source,
    });
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
  const commandSources: CommandSource[] = [];
  const actionContext: ActionCheckContext = {
    checkedLocalActions: new Set<string>(),
    commandSources,
    localActionStack: [],
    projectRoot,
    provenance,
    usedProvenance,
    violations,
  };
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
    checkActionPins(workflow, source, relativePath, actionContext);
    commandSources.push(...collectRunBlocks(workflow, projectRoot, relativePath));
  }

  for (const actionId of Object.keys(provenance)) {
    if (!usedProvenance.has(actionId)) {
      violations.push(`scripts/check/github-actions-provenance.json: unused entry for ${actionId}`);
    }
  }

  checkDelegatedScripts(projectRoot, commandSources, violations);
  checkDependabot(projectRoot, violations);

  return violations;
}
