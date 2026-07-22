#!/usr/bin/env ts-node
/**
 * Enforce repository-owned GitHub automation security policy.
 *
 * The checks are intentionally local and deterministic: CI must reject a
 * mutable action ref, implicit token permissions, or a reintroduced merge
 * path without needing network access.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';
import { log } from '../util/logger';

const projectRoot = join(__dirname, '../..');
const workflowsDir = join(projectRoot, '.github', 'workflows');
const dependabotPath = join(projectRoot, '.github', 'dependabot.yml');
const forbiddenAutoMergePath = join(workflowsDir, 'dependabot-auto-merge.yml');

const violations: string[] = [];

type YamlRecord = Record<string, unknown>;

function asRecord(value: unknown): YamlRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as YamlRecord)
    : undefined;
}

function parseYaml(path: string): YamlRecord | undefined {
  try {
    return asRecord(load(readFileSync(path, 'utf8')));
  } catch (error) {
    violations.push(`${path}: invalid YAML (${String(error)})`);
    return undefined;
  }
}

function permissionMap(value: unknown): YamlRecord | undefined {
  return asRecord(value);
}

function hasExplicitPermissions(workflow: YamlRecord): boolean {
  if (workflow.permissions !== undefined) {
    return true;
  }

  const jobs = asRecord(workflow.jobs);
  return Boolean(
    jobs &&
    Object.values(jobs).every((job) => {
      const jobRecord = asRecord(job);
      return jobRecord?.permissions !== undefined;
    })
  );
}

function sameStringSet(value: unknown, expected: string[]): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((item) => value.includes(item))
  );
}

function checkActionPins(relativePath: string, source: string): void {
  const actionLine = /^\s*-?\s*uses:\s*([^\s#]+)(?:\s+#\s*(\S+))?\s*$/gm;
  for (const match of source.matchAll(actionLine)) {
    const actionRef = match[1];
    const versionComment = match[2];
    if (actionRef.startsWith('./') || actionRef.startsWith('docker://')) {
      continue;
    }

    const separator = actionRef.lastIndexOf('@');
    const ref = separator >= 0 ? actionRef.slice(separator + 1) : '';
    if (!/^[0-9a-f]{40}$/.test(ref)) {
      violations.push(
        `${relativePath}: external action is not pinned to a 40-character commit: ${actionRef}`
      );
    }
    if (!versionComment || !/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(versionComment)) {
      violations.push(
        `${relativePath}: pinned action must have an exact release comment: ${actionRef}`
      );
    }
  }
}

function checkMergePaths(relativePath: string, source: string): void {
  const executableSource = source
    .split('\n')
    .filter((line) => !/^\s*#/.test(line))
    .join('\n');
  const forbiddenPatterns: Array<[RegExp, string]> = [
    [/\bgh\s+pr\s+merge\b/i, 'gh pr merge'],
    [/\bgh\s+api\b/i, 'gh api'],
    [/^\s*-?\s*uses:\s*[^#\n]*(?:auto-?merge|merge-pull-request)/im, 'merge action'],
    [/\bpulls[/.][^\s"'`]*[/.]merge\b/i, 'REST pull merge endpoint'],
    [/\bmergePullRequest\b/i, 'GraphQL mergePullRequest mutation'],
    [/\benablePullRequestAutoMerge\b/i, 'GraphQL enablePullRequestAutoMerge mutation'],
    [/\bpullRequests?\s*\.\s*merge\b/i, 'Octokit pull request merge call'],
  ];

  for (const [pattern, description] of forbiddenPatterns) {
    if (pattern.test(executableSource)) {
      violations.push(`${relativePath}: forbidden merge API path found (${description})`);
    }
  }
}

function checkWorkflowPermissions(relativePath: string, workflow: YamlRecord): void {
  if (!hasExplicitPermissions(workflow)) {
    violations.push(
      `${relativePath}: token permissions must be explicit at workflow or every job level`
    );
  }

  if (relativePath === '.github/workflows/ci.yml') {
    const permissions = permissionMap(workflow.permissions);
    if (!permissions || Object.keys(permissions).length !== 1 || permissions.contents !== 'read') {
      violations.push(`${relativePath}: ordinary CI permissions must be exactly contents: read`);
    }
  }

  if (relativePath === '.github/workflows/publish.yml') {
    const jobs = asRecord(workflow.jobs);
    const publish = asRecord(jobs?.publish);
    const release = asRecord(jobs?.['github-release']);
    const publishPermissions = permissionMap(publish?.permissions);
    const releasePermissions = permissionMap(release?.permissions);

    if (
      !publishPermissions ||
      Object.keys(publishPermissions).length !== 2 ||
      publishPermissions.contents !== 'read' ||
      publishPermissions['id-token'] !== 'write'
    ) {
      violations.push(
        `${relativePath}: publish job permissions must be exactly contents: read and id-token: write`
      );
    }
    if (
      !releasePermissions ||
      Object.keys(releasePermissions).length !== 1 ||
      releasePermissions.contents !== 'write'
    ) {
      violations.push(
        `${relativePath}: github-release permissions must be exactly contents: write`
      );
    }
  }
}

function checkWorkflows(): void {
  if (existsSync(forbiddenAutoMergePath)) {
    violations.push(
      '.github/workflows/dependabot-auto-merge.yml: auto-merge workflow must not exist'
    );
  }

  const workflowFiles = readdirSync(workflowsDir)
    .filter((name) => /\.ya?ml$/.test(name))
    .sort();

  for (const filename of workflowFiles) {
    const relativePath = `.github/workflows/${filename}`;
    const path = join(workflowsDir, filename);
    const source = readFileSync(path, 'utf8');
    const workflow = parseYaml(path);

    checkActionPins(relativePath, source);
    checkMergePaths(relativePath, source);
    if (workflow) {
      checkWorkflowPermissions(relativePath, workflow);
    }
  }
}

function checkDependabot(): void {
  const config = parseYaml(dependabotPath);
  const updates = config?.updates;
  if (!Array.isArray(updates)) {
    violations.push('.github/dependabot.yml: updates must be an array');
    return;
  }

  const actionsUpdates = updates.filter(
    (entry) => asRecord(entry)?.['package-ecosystem'] === 'github-actions'
  );
  if (actionsUpdates.length !== 1) {
    violations.push(
      '.github/dependabot.yml: expected exactly one github-actions update configuration'
    );
    return;
  }

  const actionsConfig = asRecord(actionsUpdates[0]);
  const schedule = asRecord(actionsConfig?.schedule);
  const cooldown = asRecord(actionsConfig?.cooldown);
  const groups = asRecord(actionsConfig?.groups);
  const actionGroup = asRecord(groups?.['github-actions']);

  if (schedule?.timezone !== 'America/Los_Angeles') {
    violations.push('.github/dependabot.yml: github-actions timezone must be America/Los_Angeles');
  }
  if (cooldown?.['default-days'] !== 14) {
    violations.push('.github/dependabot.yml: github-actions cooldown.default-days must be 14');
  }
  if (
    !sameStringSet(actionGroup?.patterns, ['*']) ||
    !sameStringSet(actionGroup?.['update-types'], ['minor', 'patch'])
  ) {
    violations.push(
      '.github/dependabot.yml: github-actions grouping must remain limited to minor and patch updates'
    );
  }
}

function main(): void {
  checkWorkflows();
  checkDependabot();

  if (violations.length > 0) {
    log.error(`GitHub automation policy failed with ${violations.length} violation(s):`);
    for (const violation of violations) {
      log.error(`- ${violation}`);
    }
    process.exit(1);
  }

  log.success('GitHub automation policy passed');
}

main();
