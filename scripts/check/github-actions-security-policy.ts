import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'fs';
import { dirname, extname, join, relative, resolve } from 'path';
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
const JAVASCRIPT_TYPESCRIPT_SUFFIX = /\.(?:[cm]?[jt]sx?)$/;
const MODULE_FILE_SUFFIXES = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'];

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
  [/\bmergePullRequest\b/i, 'GraphQL pull request merge mutation'],
  [/\benablePullRequestAutoMerge\b/i, 'GraphQL automatic pull request merge mutation'],
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

function scriptKindForPath(relativePath: string): ts.ScriptKind {
  switch (extname(relativePath)) {
    case '.tsx':
      return ts.ScriptKind.TSX;
    case '.jsx':
      return ts.ScriptKind.JSX;
    case '.ts':
    case '.mts':
    case '.cts':
      return ts.ScriptKind.TS;
    case '.js':
    case '.mjs':
    case '.cjs':
    default:
      return ts.ScriptKind.JS;
  }
}

function javaScriptSourceFile(relativePath: string, source: string): ts.SourceFile {
  return ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForPath(relativePath)
  );
}

function stripJavaScriptNonExecutableTrivia(source: string, relativePath: string): string {
  const sourceFile = javaScriptSourceFile(relativePath, source);
  const ranges = new Map<string, { end: number; pos: number }>();
  const collectRanges = (commentRanges: ts.CommentRange[] | undefined): void => {
    for (const range of commentRanges ?? []) {
      ranges.set(`${range.pos}:${range.end}`, range);
    }
  };
  const visit = (node: ts.Node): void => {
    if (ts.isRegularExpressionLiteral(node)) {
      const range = { pos: node.getStart(sourceFile), end: node.end };
      ranges.set(`${range.pos}:${range.end}`, range);
    }
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
  const sanitizedSource = JAVASCRIPT_TYPESCRIPT_SUFFIX.test(relativePath)
    ? stripJavaScriptNonExecutableTrivia(source, relativePath)
    : source;
  return sanitizedSource
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

interface ShellSubstitutionExtraction {
  nestedCommands: string[];
  source: string;
}

const SHELL_SUBSTITUTION_MARKER = '__CLAUDELINT_COMMAND_SUBSTITUTION__';

function extractShellCommandSubstitutions(
  source: string,
  violations: string[],
  location: string
): ShellSubstitutionExtraction | undefined {
  const nestedCommands: string[] = [];
  let extracted = '';
  let quote: "'" | '"' | undefined;
  let escaped = false;
  let wordStarted = false;

  const dollarSubstitution = (start: number): { command: string; end: number } | undefined => {
    let depth = 1;
    let innerQuote: "'" | '"' | '`' | undefined;
    let innerEscaped = false;
    let innerWordStarted = false;
    for (let index = start + 2; index < source.length; index += 1) {
      const character = source[index];
      if (innerEscaped) {
        innerEscaped = false;
        innerWordStarted = true;
        continue;
      }
      if (innerQuote === "'") {
        if (character === "'") {
          innerQuote = undefined;
        }
        continue;
      }
      if (innerQuote === '"') {
        if (character === '"') {
          innerQuote = undefined;
        } else if (character === '\\') {
          innerEscaped = true;
        } else if (character === '$' && source[index + 1] === '(' && source[index + 2] !== '(') {
          const nested = dollarSubstitution(index);
          if (!nested) {
            return undefined;
          }
          index = nested.end;
        }
        continue;
      }
      if (innerQuote === '`') {
        if (character === '`') {
          innerQuote = undefined;
        } else if (character === '\\') {
          innerEscaped = true;
        }
        continue;
      }
      if (character === '\\') {
        innerEscaped = true;
      } else if (character === "'" || character === '"' || character === '`') {
        innerQuote = character;
        innerWordStarted = true;
      } else if (character === '#' && !innerWordStarted) {
        const newline = source.indexOf('\n', index);
        if (newline < 0) {
          return undefined;
        }
        index = newline;
        innerWordStarted = false;
      } else if (character === '$' && source[index + 1] === '(' && source[index + 2] !== '(') {
        const nested = dollarSubstitution(index);
        if (!nested) {
          return undefined;
        }
        index = nested.end;
        innerWordStarted = true;
      } else if (character === '(') {
        depth += 1;
        innerWordStarted = true;
      } else if (character === ')') {
        depth -= 1;
        if (depth === 0) {
          return { command: source.slice(start + 2, index), end: index };
        }
      } else if (/\s/.test(character) || [';', '|', '&'].includes(character)) {
        innerWordStarted = false;
      } else {
        innerWordStarted = true;
      }
    }
    return undefined;
  };

  const backtickSubstitution = (start: number): { command: string; end: number } | undefined => {
    let innerEscaped = false;
    for (let index = start + 1; index < source.length; index += 1) {
      const character = source[index];
      if (innerEscaped) {
        innerEscaped = false;
      } else if (character === '\\') {
        innerEscaped = true;
      } else if (character === '`') {
        return { command: source.slice(start + 1, index), end: index };
      }
    }
    return undefined;
  };

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      extracted += character;
      escaped = false;
      wordStarted = true;
      continue;
    }
    if (quote === "'") {
      extracted += character;
      if (character === "'") {
        quote = undefined;
      }
      continue;
    }
    if (character === '\\') {
      extracted += character;
      escaped = true;
      wordStarted = true;
      continue;
    }
    if (quote === '"' && character === '"') {
      extracted += character;
      quote = undefined;
      continue;
    }
    if (!quote && character === "'") {
      extracted += character;
      quote = "'";
      wordStarted = true;
      continue;
    }
    if (!quote && character === '"') {
      extracted += character;
      quote = '"';
      wordStarted = true;
      continue;
    }
    if (!quote && character === '#' && !wordStarted) {
      const newline = source.indexOf('\n', index);
      if (newline < 0) {
        extracted += source.slice(index);
        break;
      }
      extracted += source.slice(index, newline + 1);
      index = newline;
      wordStarted = false;
      continue;
    }
    if (character === '$' && source[index + 1] === '(' && source[index + 2] !== '(') {
      const substitution = dollarSubstitution(index);
      if (!substitution) {
        violations.push(`${location}: cannot parse shell command substitution: unterminated $(`);
        return undefined;
      }
      nestedCommands.push(substitution.command);
      extracted += `$(${SHELL_SUBSTITUTION_MARKER})`;
      index = substitution.end;
      wordStarted = true;
      continue;
    }
    if (character === '`') {
      const substitution = backtickSubstitution(index);
      if (!substitution) {
        violations.push(
          `${location}: cannot parse shell command substitution: unterminated backtick`
        );
        return undefined;
      }
      nestedCommands.push(substitution.command);
      extracted += `\`${SHELL_SUBSTITUTION_MARKER}\``;
      index = substitution.end;
      wordStarted = true;
      continue;
    }
    extracted += character;
    if (!quote && (/\s/.test(character) || [';', '|', '&'].includes(character))) {
      wordStarted = false;
    } else {
      wordStarted = true;
    }
  }
  return { nestedCommands, source: extracted };
}

function shellCommands(source: string, violations: string[], location: string): string[][] {
  const commands: string[][] = [];
  let words: string[] = [];
  let word = '';
  let wordStarted = false;
  let quote: "'" | '"' | undefined;
  let escaped = false;
  let awaitingCommandAfterSeparator = false;

  const finishWord = (): void => {
    if (wordStarted) {
      words.push(word);
      word = '';
      wordStarted = false;
    }
  };
  const finishCommand = (): boolean => {
    finishWord();
    if (words.length > 0) {
      commands.push(words);
      words = [];
      awaitingCommandAfterSeparator = false;
      return true;
    }
    return false;
  };

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      if (character !== '\n') {
        word += character;
        wordStarted = true;
      }
      escaped = false;
      continue;
    }
    if (quote === "'") {
      if (character === "'") {
        quote = undefined;
      } else {
        word += character;
      }
      continue;
    }
    if (quote === '"') {
      if (character === '"') {
        quote = undefined;
      } else if (character === '\\') {
        const nextCharacter = source[index + 1];
        if (nextCharacter && ['$', '`', '"', '\\', '\n'].includes(nextCharacter)) {
          escaped = true;
        } else {
          word += character;
        }
      } else {
        word += character;
      }
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      wordStarted = true;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      wordStarted = true;
      continue;
    }
    if (character === '#' && !wordStarted) {
      finishWord();
      while (index + 1 < source.length && source[index + 1] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (/\s/.test(character)) {
      finishWord();
      if (character === '\n' || character === '\r') {
        finishCommand();
      }
      continue;
    }
    if (character === ';' || character === '|') {
      const doubled = source[index + 1] === character;
      const requiresFollowingCommand = character === '|';
      const hadCommand = finishCommand();
      if (!hadCommand || awaitingCommandAfterSeparator) {
        violations.push(`${location}: cannot parse shell command with a dangling separator`);
        return [];
      }
      awaitingCommandAfterSeparator = requiresFollowingCommand;
      if (doubled) {
        index += 1;
      }
      continue;
    }
    if (character === '&') {
      if (source[index + 1] !== '&') {
        if (word.endsWith('>') || word.endsWith('<') || source[index + 1] === '>') {
          word += character;
          wordStarted = true;
          continue;
        }
        violations.push(`${location}: cannot parse shell command with an unescaped &: ${source}`);
        return [];
      }
      const hadCommand = finishCommand();
      if (!hadCommand || awaitingCommandAfterSeparator) {
        violations.push(`${location}: cannot parse shell command with a dangling separator`);
        return [];
      }
      awaitingCommandAfterSeparator = true;
      index += 1;
      continue;
    }
    word += character;
    wordStarted = true;
  }

  if (quote || escaped) {
    violations.push(`${location}: cannot parse shell command with unterminated quoting or escape`);
    return [];
  }
  finishCommand();
  if (awaitingCommandAfterSeparator) {
    violations.push(`${location}: cannot parse shell command with a dangling separator`);
    return [];
  }
  return commands;
}

interface EnvironmentCommand {
  cwd: string;
  words: string[];
}

function resolveRepositoryDirectory(
  currentDirectory: string,
  operand: string,
  projectRoot: string,
  realRoot: string,
  violations: string[],
  location: string
): string | undefined {
  const directory = resolve(currentDirectory, operand);
  if (!isWithinDirectory(projectRoot, directory)) {
    violations.push(`${location}: command working directory resolves outside the repository`);
    return undefined;
  }
  if (!existsSync(directory) || !statSync(directory).isDirectory()) {
    violations.push(`${location}: command working directory does not exist: ${operand}`);
    return undefined;
  }
  if (!isWithinDirectory(realRoot, realpathSync(directory))) {
    violations.push(`${location}: command working directory resolves outside the repository`);
    return undefined;
  }
  return directory;
}

function unwrapEnvironmentCommand(
  words: string[],
  currentDirectory: string,
  projectRoot: string,
  realRoot: string,
  violations: string[],
  location: string
): EnvironmentCommand | undefined {
  if (!['env', '/usr/bin/env'].includes(words[0])) {
    return { cwd: currentDirectory, words };
  }

  let index = 1;
  let cwd = currentDirectory;
  while (index < words.length) {
    const word = words[index];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
      index += 1;
    } else if (['-i', '--ignore-environment', '-0', '--null'].includes(word)) {
      index += 1;
    } else if (['-u', '--unset'].includes(word)) {
      if (index + 1 >= words.length) {
        violations.push(`${location}: cannot resolve env option operand: ${word}`);
        return undefined;
      }
      index += 2;
    } else if (['-C', '--chdir'].includes(word)) {
      const operand = words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve env option operand: ${word}`);
        return undefined;
      }
      const directory = resolveRepositoryDirectory(
        cwd,
        operand,
        projectRoot,
        realRoot,
        violations,
        location
      );
      if (!directory) {
        return undefined;
      }
      cwd = directory;
      index += 2;
    } else if (/^--unset=/.test(word) || /^-u.+/.test(word)) {
      index += 1;
    } else if (/^(?:--chdir=|-C.+)/.test(word)) {
      const operand = word.startsWith('--chdir=') ? word.slice('--chdir='.length) : word.slice(2);
      const directory = resolveRepositoryDirectory(
        cwd,
        operand,
        projectRoot,
        realRoot,
        violations,
        location
      );
      if (!directory) {
        return undefined;
      }
      cwd = directory;
      index += 1;
    } else if (word === '--') {
      index += 1;
      break;
    } else if (word.startsWith('-')) {
      violations.push(`${location}: cannot resolve env option: ${word}`);
      return undefined;
    } else {
      break;
    }
  }
  if (index >= words.length) {
    violations.push(`${location}: env invocation does not identify a command`);
    return undefined;
  }
  return { cwd, words: words.slice(index) };
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

function packageInstallLifecycleTargets(
  manager: string,
  command: string | undefined,
  args: string[],
  scripts: YamlRecord,
  currentDirectory: string,
  violations: string[],
  location: string
): string[] | undefined {
  const npmInstallAliases = new Set([
    'add',
    'i',
    'in',
    'ins',
    'inst',
    'insta',
    'instal',
    'install',
    'isnt',
    'isnta',
    'isntal',
    'isntall',
  ]);
  const installCommands: Record<string, Set<string>> = {
    npm: new Set(['ci', ...npmInstallAliases]),
    pnpm: new Set(['add', 'i', 'install']),
    yarn: new Set(['add', 'install']),
  };
  if (
    manager === 'npm' &&
    command &&
    /^(?:ins|isnt)/.test(command) &&
    !npmInstallAliases.has(command)
  ) {
    violations.push(`${location}: cannot resolve package-manager install invocation: ${command}`);
    return [];
  }
  if (!command || !installCommands[manager]?.has(command)) {
    return undefined;
  }

  const noOperandOptions = new Set([
    '--dev',
    '--foreground-scripts',
    '--frozen-lockfile',
    '--ignore-scripts',
    '--immutable',
    '--lockfile-only',
    '--no-save',
    '--offline',
    '--prefer-offline',
    '--prod',
    '--production',
    '--save-dev',
    '-D',
  ]);
  const unsupportedScopeOptions = new Set(['--filter', '--workspace', '-w']);
  const positionals: string[] = [];
  let scriptsEnabled = true;
  for (let index = 0; index < args.length; index += 1) {
    const word = args[index];
    if (word === '--') {
      positionals.push(...args.slice(index + 1));
      break;
    }
    const separator = word.indexOf('=');
    const option = separator >= 0 ? word.slice(0, separator) : word;
    if (noOperandOptions.has(option)) {
      if (option === '--ignore-scripts') {
        const separatedValue = separator < 0 ? args[index + 1] : undefined;
        const value = separator >= 0 ? word.slice(separator + 1) : (separatedValue ?? 'true');
        if (!['false', 'true'].includes(value)) {
          violations.push(
            `${location}: cannot resolve package-manager install invocation: ${word}`
          );
          return [];
        }
        scriptsEnabled = value === 'false';
        if (separator < 0 && separatedValue && ['false', 'true'].includes(separatedValue)) {
          index += 1;
        }
      }
      continue;
    }
    if (unsupportedScopeOptions.has(option)) {
      violations.push(`${location}: cannot resolve package-manager install invocation: ${word}`);
      return [];
    }
    if (word.startsWith('-')) {
      violations.push(`${location}: cannot resolve package-manager install invocation: ${word}`);
      return [];
    }
    if (
      /^(?:file:|link:|workspace:|\.\.?\/)/.test(word) ||
      word.startsWith('/') ||
      existsSync(resolve(currentDirectory, word))
    ) {
      violations.push(`${location}: cannot resolve package-manager install invocation: ${word}`);
      return [];
    }
    positionals.push(word);
  }

  if (
    (command === 'ci' && positionals.length > 0) ||
    (command === 'add' && positionals.length === 0)
  ) {
    violations.push(`${location}: cannot resolve package-manager install invocation`);
    return [];
  }
  return scriptsEnabled
    ? [
        'prepublish',
        'preinstall',
        'install',
        'postinstall',
        'preprepare',
        'prepare',
        'postprepare',
      ].filter((name) => typeof scripts[name] === 'string')
    : [];
}

function packagePublicationLifecycleTargets(
  manager: string,
  command: string | undefined,
  args: string[],
  scripts: YamlRecord,
  violations: string[],
  location: string
): string[] | undefined {
  if (!command || !['pack', 'publish'].includes(command)) {
    return undefined;
  }
  const noOperandOptions = new Set([
    '--dry-run',
    '--ignore-scripts',
    '--json',
    '--provenance',
    '--silent',
  ]);
  const operandOptions = new Set(['--access', '--new-version', '--otp', '--registry', '--tag']);
  let scriptsEnabled = true;
  for (let index = 0; index < args.length; index += 1) {
    const word = args[index];
    const separator = word.indexOf('=');
    const option = separator >= 0 ? word.slice(0, separator) : word;
    if (noOperandOptions.has(option)) {
      if (option === '--ignore-scripts') {
        const separatedValue = separator < 0 ? args[index + 1] : undefined;
        const value = separator >= 0 ? word.slice(separator + 1) : (separatedValue ?? 'true');
        if (!['false', 'true'].includes(value)) {
          violations.push(
            `${location}: cannot resolve package-manager publication invocation: ${word}`
          );
          return [];
        }
        scriptsEnabled = value === 'false';
        if (separator < 0 && separatedValue && ['false', 'true'].includes(separatedValue)) {
          index += 1;
        }
      }
      continue;
    }
    if (operandOptions.has(option)) {
      const operand = separator >= 0 ? word.slice(separator + 1) : args[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve package-manager publication invocation`);
        return [];
      }
      index += separator >= 0 ? 0 : 1;
      continue;
    }
    violations.push(`${location}: cannot resolve package-manager publication invocation: ${word}`);
    return [];
  }
  if (!scriptsEnabled) {
    return [];
  }
  const lifecycle =
    command === 'pack'
      ? ['prepack', 'prepare', 'postpack']
      : [
          ...(manager === 'npm' ? [] : ['prepublish']),
          'prepublishOnly',
          'prepack',
          'prepare',
          'postpack',
          'publish',
          'postpublish',
        ];
  return lifecycle.filter((name) => typeof scripts[name] === 'string');
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
    const command =
      manager === 'yarn' && commandIndex === words.length ? 'install' : words[commandIndex];
    const installTargets = packageInstallLifecycleTargets(
      manager,
      command,
      words.slice(commandIndex + 1),
      scripts,
      currentDirectory,
      violations,
      location
    );
    if (installTargets) {
      return installTargets;
    }
    const publicationTargets = packagePublicationLifecycleTargets(
      manager,
      command,
      words.slice(commandIndex + 1),
      scripts,
      violations,
      location
    );
    if (publicationTargets) {
      return publicationTargets;
    }
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
      targets.push(...lifecycleScripts(directTarget, scripts));
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
      for (const match of matches) {
        targets.push(...lifecycleScripts(match, scripts));
      }
    }
  }
  return targets;
}

function addRepositoryOperand(paths: string[], operand: string | undefined): void {
  if (operand && REPOSITORY_PATH_PREFIX.test(operand)) {
    paths.push(operand);
  }
}

function addInterpreterEntrypoint(paths: string[], operand: string | undefined): void {
  if (operand && operand !== '-') {
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
  addInterpreterEntrypoint(paths, words[index]);
  if (index >= words.length && !hasInlineCode) {
    violations.push(`${location}: interpreter invocation does not identify an entrypoint`);
  }
  return paths;
}

interface InvocationTargets {
  nestedCommands: string[];
  paths: string[];
}

function genericInterpreterTargets(
  interpreter: string,
  words: string[],
  violations: string[],
  location: string
): InvocationTargets {
  const paths: string[] = [];
  const nestedCommands: string[] = [];
  let index = 1;
  while (index < words.length && words[index].startsWith('-')) {
    const word = words[index];
    if (word === '--') {
      index += 1;
      break;
    }
    if ((interpreter === 'bash' || interpreter === 'sh') && /^-[A-Za-z]+$/.test(word)) {
      const flags = word.slice(1);
      if (flags.includes('c')) {
        const command = words[index + 1];
        if (!command) {
          violations.push(`${location}: cannot resolve interpreter option operand: -c`);
          return { nestedCommands, paths };
        }
        nestedCommands.push(command);
        return { nestedCommands, paths };
      }
      if (flags.includes('O') || flags.includes('o')) {
        if (!words[index + 1]) {
          violations.push(`${location}: cannot resolve interpreter option operand: ${word}`);
          return { nestedCommands, paths };
        }
        index += 2;
        continue;
      }
      index += 1;
    } else if (['--noprofile', '--norc', '--posix'].includes(word)) {
      index += 1;
    } else if (['--init-file', '--rcfile'].includes(word)) {
      const operand = words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${word}`);
        return { nestedCommands, paths };
      }
      addInterpreterEntrypoint(paths, operand);
      index += 2;
    } else if (['-r', '--require'].includes(word)) {
      const operand = words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot resolve interpreter option operand: ${word}`);
        return { nestedCommands, paths };
      }
      addRepositoryOperand(paths, operand);
      index += 2;
    } else {
      violations.push(`${location}: cannot resolve interpreter option: ${word}`);
      return { nestedCommands, paths };
    }
  }
  addInterpreterEntrypoint(paths, words[index]);
  if (index >= words.length) {
    violations.push(`${location}: interpreter invocation does not identify an entrypoint`);
  }
  return { nestedCommands, paths };
}

function invokedTargets(
  words: string[],
  violations: string[],
  location: string
): InvocationTargets {
  const commandName = words[0]?.split('/').pop();
  if (commandName === 'node') {
    return { nestedCommands: [], paths: nodeExecutableOperands(words, violations, location) };
  }
  if (commandName && SCRIPT_INTERPRETER.test(commandName)) {
    return genericInterpreterTargets(commandName, words, violations, location);
  }
  if (words[0] === '.' || words[0] === 'source') {
    if (!words[1]) {
      violations.push(`${location}: source invocation does not identify a script`);
      return { nestedCommands: [], paths: [] };
    }
    return {
      nestedCommands: [],
      paths: REPOSITORY_PATH_PREFIX.test(words[1]) ? [words[1]] : [],
    };
  }
  return {
    nestedCommands: [],
    paths: words[0] && REPOSITORY_PATH_PREFIX.test(words[0]) ? [words[0]] : [],
  };
}

function commandPositionIndex(words: string[]): number {
  let index = words[0] === 'exec' ? 1 : 0;
  while (index < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index])) {
    let substitutionDepth = 0;
    let unmatchedBacktick = false;
    let sawSubstitution = false;
    for (let wordIndex = index; wordIndex < words.length; wordIndex += 1) {
      const word = words[wordIndex];
      for (let characterIndex = 0; characterIndex < word.length; characterIndex += 1) {
        let precedingBackslashes = 0;
        for (
          let precedingIndex = characterIndex - 1;
          precedingIndex >= 0 && word[precedingIndex] === '\\';
          precedingIndex -= 1
        ) {
          precedingBackslashes += 1;
        }
        const isEscaped = precedingBackslashes % 2 === 1;
        if (word.slice(characterIndex, characterIndex + 2) === '$(') {
          substitutionDepth += 1;
          sawSubstitution = true;
          characterIndex += 1;
        } else if (word[characterIndex] === ')' && substitutionDepth > 0 && !isEscaped) {
          substitutionDepth -= 1;
        } else if (word[characterIndex] === '`' && !isEscaped) {
          unmatchedBacktick = !unmatchedBacktick;
          sawSubstitution = true;
        }
      }
      if (!sawSubstitution || (substitutionDepth === 0 && !unmatchedBacktick)) {
        index = wordIndex + 1;
        break;
      }
      if (wordIndex === words.length - 1) {
        return words.length;
      }
    }
  }
  return index;
}

function stripLeadingRedirections(
  words: string[],
  violations: string[],
  location: string
): string[] | undefined {
  let index = 0;
  const descriptor = String.raw`(?:\d*|\{[A-Za-z_][A-Za-z0-9_]*\})`;
  while (index < words.length) {
    const word = words[index];
    const duplicate = word.match(new RegExp(`^${descriptor}[<>]&(.+)?$`));
    if (duplicate) {
      const operand = duplicate[1] || words[index + 1];
      if (!operand || !/^(?:\d+|-)$/.test(operand)) {
        violations.push(`${location}: cannot parse shell redirection: ${word}`);
        return undefined;
      }
      index += duplicate[1] ? 1 : 2;
      continue;
    }

    const separated = word.match(
      new RegExp(`^(?:${descriptor}(?:>>?|<<-|<<<|<<|<>|<|>\\|)|&>>?)$`)
    );
    if (separated) {
      const operand = words[index + 1];
      if (!operand) {
        violations.push(`${location}: cannot parse shell redirection: ${word}`);
        return undefined;
      }
      if (/\$\(|`/.test(operand)) {
        violations.push(
          `${location}: cannot parse shell command substitution in redirection operand`
        );
      }
      index += 2;
      continue;
    }

    if (
      new RegExp(`^${descriptor}(?:>>?|<<-|<<<|<<|<>|<|>\\|).+`).test(word) ||
      /^&>>?.+/.test(word)
    ) {
      if (/\$\(|`/.test(word)) {
        violations.push(
          `${location}: cannot parse shell command substitution in redirection operand`
        );
      }
      index += 1;
      continue;
    }
    break;
  }
  return words.slice(index);
}

function staticShellDirectoryVariables(
  commandSource: CommandSource,
  projectRoot: string,
  realRoot: string
): Map<string, string> {
  const variables = new Map<string, string>();
  if (!/\.(?:bash|sh)$/.test(commandSource.relativePath)) {
    return variables;
  }
  const scriptPath = resolve(projectRoot, commandSource.relativePath);
  if (!existsSync(scriptPath) || !statSync(scriptPath).isFile()) {
    return variables;
  }
  const addDirectory = (name: string, base: string, relativeDirectory = '.'): void => {
    if (!/^\.{1,2}(?:\/.{1,2})*$/.test(relativeDirectory)) {
      return;
    }
    const directory = resolve(base, relativeDirectory);
    if (
      isWithinDirectory(projectRoot, directory) &&
      existsSync(directory) &&
      statSync(directory).isDirectory() &&
      isWithinDirectory(realRoot, realpathSync(directory))
    ) {
      variables.set(name, directory);
    }
  };

  for (const line of commandSource.source.split('\n')) {
    const scriptDirectory = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)="\$\(cd "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)" && pwd\)"$/
    );
    if (scriptDirectory) {
      addDirectory(scriptDirectory[1], dirname(scriptPath));
      continue;
    }
    const scriptRelativeDirectory = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)="\$\(cd "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)\/([^"]+)" && pwd\)"$/
    );
    if (scriptRelativeDirectory) {
      addDirectory(scriptRelativeDirectory[1], dirname(scriptPath), scriptRelativeDirectory[2]);
      continue;
    }
    const variableRelativeDirectory = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)="\$\(cd "\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))\/([^"]+)" && pwd\)"$/
    );
    if (variableRelativeDirectory) {
      const base = variables.get(variableRelativeDirectory[2] ?? variableRelativeDirectory[3]);
      if (base) {
        addDirectory(variableRelativeDirectory[1], base, variableRelativeDirectory[4]);
      }
    }
  }
  return variables;
}

function staticShellDirectorySubstitutions(
  source: string,
  variables: Map<string, string>
): Set<string> {
  const substitutions = new Set<string>();
  for (const line of source.split('\n')) {
    const assignment = line.match(/^([A-Za-z_][A-Za-z0-9_]*)="\$\((.*)\)"$/);
    const body = assignment?.[2];
    const safeBody =
      body &&
      (/^cd "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)(?:\/\.{1,2}(?:\/\.{1,2})*)?" && pwd$/.test(
        body
      ) ||
        /^cd "\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)\/\.{1,2}(?:\/\.{1,2})*" && pwd$/.test(
          body
        ));
    if (assignment && safeBody && variables.has(assignment[1])) {
      substitutions.add(assignment[2]);
    }
  }
  return substitutions;
}

function lifecycleScripts(target: string, scripts: YamlRecord): string[] {
  return [`pre${target}`, target, `post${target}`].filter(
    (name) => typeof scripts[name] === 'string'
  );
}

function staticRepositoryDependencies(relativePath: string, source: string): string[] {
  if (!JAVASCRIPT_TYPESCRIPT_SUFFIX.test(relativePath)) {
    return [];
  }
  const dependencies = new Set<string>();
  const sourceFile = javaScriptSourceFile(relativePath, source);
  const addSpecifier = (value: ts.Expression | undefined): void => {
    if (value && ts.isStringLiteralLike(value) && /^\.\.?\//.test(value.text)) {
      dependencies.add(value.text);
    }
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addSpecifier(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      addSpecifier(node.moduleReference.expression);
    } else if (ts.isCallExpression(node) && node.arguments.length === 1) {
      if (
        (ts.isIdentifier(node.expression) && node.expression.text === 'require') ||
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        addSpecifier(node.arguments[0]);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...dependencies];
}

function resolveRepositoryDependency(
  importerPath: string,
  specifier: string,
  projectRoot: string,
  realRoot: string,
  violations: string[],
  location: string
): string | undefined {
  const basePath = resolve(dirname(importerPath), specifier);
  if (!isWithinDirectory(projectRoot, basePath)) {
    violations.push(`${location}: dependency resolves outside the repository: ${specifier}`);
    return undefined;
  }

  const candidates = new Set<string>();
  const addFile = (candidate: string): void => {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      candidates.add(candidate);
    }
  };
  addFile(basePath);
  for (const suffix of MODULE_FILE_SUFFIXES) {
    addFile(`${basePath}${suffix}`);
  }
  if (existsSync(basePath) && statSync(basePath).isDirectory()) {
    for (const suffix of MODULE_FILE_SUFFIXES) {
      addFile(join(basePath, `index${suffix}`));
    }
  }

  if (candidates.size === 0) {
    violations.push(`${location}: cannot resolve repository-relative dependency: ${specifier}`);
    return undefined;
  }
  if (candidates.size > 1) {
    violations.push(`${location}: repository-relative dependency is ambiguous: ${specifier}`);
    return undefined;
  }
  const [candidate] = candidates;
  const realCandidate = realpathSync(candidate);
  if (!isWithinDirectory(realRoot, realCandidate)) {
    violations.push(`${location}: dependency resolves outside the repository: ${specifier}`);
    return undefined;
  }
  if (!isWithinDirectory(projectRoot, candidate)) {
    violations.push(`${location}: dependency resolves outside the repository: ${specifier}`);
    return undefined;
  }
  return candidate;
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
      const directoryVariables = staticShellDirectoryVariables(
        commandSource,
        projectRoot,
        realRoot
      );
      const safeDirectorySubstitutions = staticShellDirectorySubstitutions(
        commandSource.source,
        directoryVariables
      );
      let executable = executableSource(commandSource.relativePath, commandSource.source);
      if (!JAVASCRIPT_TYPESCRIPT_SUFFIX.test(commandSource.relativePath)) {
        const extracted = extractShellCommandSubstitutions(
          executable,
          violations,
          commandSource.relativePath
        );
        if (!extracted) {
          continue;
        }
        executable = extracted.source;
        for (const nestedCommand of extracted.nestedCommands) {
          if (safeDirectorySubstitutions.has(nestedCommand)) {
            continue;
          }
          sourceQueue.push({
            cwd: currentDirectory,
            relativePath: commandSource.relativePath,
            source: nestedCommand,
          });
        }
      }
      for (const parsedWords of shellCommands(executable, violations, commandSource.relativePath)) {
        const redirectedWords = stripLeadingRedirections(
          parsedWords,
          violations,
          commandSource.relativePath
        );
        if (!redirectedWords) {
          continue;
        }
        let commandWords = redirectedWords;
        let normalizationFailed = false;
        while (commandWords.length > 0) {
          const substitutionIndex = commandPositionIndex(commandWords);
          if (/\$\(|`/.test(commandWords[substitutionIndex] ?? '')) {
            violations.push(
              `${commandSource.relativePath}: cannot parse shell command substitution in command position`
            );
            normalizationFailed = true;
            break;
          }
          if (substitutionIndex > 0) {
            commandWords = commandWords.slice(substitutionIndex);
            continue;
          }
          const strippedRedirections = stripLeadingRedirections(
            commandWords,
            violations,
            commandSource.relativePath
          );
          if (!strippedRedirections) {
            normalizationFailed = true;
            break;
          }
          if (strippedRedirections.length === commandWords.length) {
            break;
          }
          commandWords = strippedRedirections;
        }
        if (normalizationFailed) {
          continue;
        }
        if (commandWords.length === 0) {
          continue;
        }
        if (commandWords[0] === 'cd') {
          if (commandWords.length !== 2) {
            violations.push(
              `${commandSource.relativePath}: cannot resolve cd invocation unambiguously`
            );
            continue;
          }
          const variable = commandWords[1].match(
            /^\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))$/
          );
          const directory = variable
            ? directoryVariables.get(variable[1] ?? variable[2])
            : resolveRepositoryDirectory(
                currentDirectory,
                commandWords[1],
                projectRoot,
                realRoot,
                violations,
                commandSource.relativePath
              );
          if (variable && !directory) {
            violations.push(
              `${commandSource.relativePath}: cannot resolve cd variable statically: ${commandWords[1]}`
            );
          }
          if (directory) {
            currentDirectory = directory;
          }
          continue;
        }
        const environment = unwrapEnvironmentCommand(
          commandWords,
          currentDirectory,
          projectRoot,
          realRoot,
          violations,
          commandSource.relativePath
        );
        if (!environment) {
          continue;
        }
        for (const target of packageScriptTargets(
          environment.words,
          scripts,
          environment.cwd,
          projectRoot,
          violations,
          commandSource.relativePath
        )) {
          packageQueue.push(target);
        }
        const targets = invokedTargets(environment.words, violations, commandSource.relativePath);
        for (const source of targets.nestedCommands) {
          sourceQueue.push({
            cwd: environment.cwd,
            relativePath: commandSource.relativePath,
            source,
          });
        }
        for (const path of targets.paths) {
          executableQueue.push({ cwd: environment.cwd, path });
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
    for (const specifier of staticRepositoryDependencies(displayPath, source)) {
      const dependency = resolveRepositoryDependency(
        absolutePath,
        specifier,
        projectRoot,
        realRoot,
        violations,
        displayPath
      );
      if (dependency) {
        executableQueue.push({ cwd: executableReference.cwd, path: dependency });
      }
    }
    if (JAVASCRIPT_TYPESCRIPT_SUFFIX.test(displayPath)) {
      checkMergeMutations(displayPath, source, violations);
    } else {
      sourceQueue.push({
        cwd: executableReference.cwd,
        relativePath: displayPath,
        source,
      });
    }
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
