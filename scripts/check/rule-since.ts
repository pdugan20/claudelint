#!/usr/bin/env ts-node
/**
 * Rule `since` Field Validator
 *
 * Verifies all built-in rules have valid `since` metadata:
 * 1. Every built-in rule must define `since`
 * 2. Value must be valid semver
 * 3. Value must not contain pre-release suffix (stable versions only)
 * 4. Value must be <= the current stable target version
 *
 * Run: npm run check:rule-since
 */

import { readFile, readdir, stat } from 'fs/promises';
import { readFileSync } from 'fs';
import { join, relative } from 'path';
import { log } from '../util/logger';

const projectRoot = join(__dirname, '../..');
const rulesDir = join(projectRoot, 'src/rules');

/** Semver regex (same as src/utils/rules/helpers.ts) */
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/** Files to skip (auto-generated, not actual rules) */
const SKIP_FILES = new Set(['index.ts', 'rule-ids.ts']);

interface Violation {
  file: string;
  issue: string;
}

const violations: Violation[] = [];

/** Get stable target version from package.json */
function getStableTarget(): string {
  const pkg = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8')) as {
    version: string;
  };
  return pkg.version.replace(/-.*$/, '');
}

/** Get the next minor version (allows rules targeting the upcoming release) */
function getNextMinor(version: string): string {
  const parts = version.split('.').map(Number);
  return `${parts[0]}.${parts[1] + 1}.0`;
}

/** Compare two semver strings. Returns -1, 0, or 1. */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] < pb[i]) return -1;
    if (pa[i] > pb[i]) return 1;
  }
  return 0;
}

/** Extract `since` value from a rule file's source text */
function extractSinceValue(content: string): string | null {
  // Match since: 'value' or since: "value" in the meta object
  const match = content.match(/since:\s*['"]([^'"]*)['"]/);
  return match ? match[1] : null;
}

/** Scan a single rule file */
async function checkRuleFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const relPath = relative(projectRoot, filePath);

  // Skip files that don't export a rule
  if (!content.includes('export const rule') && !content.includes('export default')) {
    return;
  }

  const since = extractSinceValue(content);

  // Check 1: Presence
  if (since === null) {
    violations.push({ file: relPath, issue: 'Missing `since` field in rule metadata' });
    return;
  }

  // Check 2: Valid semver
  if (!SEMVER_PATTERN.test(since)) {
    violations.push({
      file: relPath,
      issue: `Invalid semver in \`since\`: '${since}'`,
    });
    return;
  }

  // Check 3: No pre-release suffix
  if (since.includes('-')) {
    violations.push({
      file: relPath,
      issue: `Pre-release suffix not allowed for built-in rules: '${since}'. Use stable version (e.g., '${since.replace(/-.*$/, '')}')`,
    });
    return;
  }

  // Check 4: Not beyond next planned minor release
  const stableTarget = getStableTarget();
  const nextMinor = getNextMinor(stableTarget);
  if (compareSemver(since, nextMinor) > 0) {
    violations.push({
      file: relPath,
      issue: `\`since\` value '${since}' exceeds next planned release '${nextMinor}' (current: '${stableTarget}')`,
    });
  }
}

/** Recursively scan all rule files in a directory */
async function scanDirectory(dirPath: string): Promise<void> {
  const entries = await readdir(dirPath);

  for (const entry of entries) {
    if (SKIP_FILES.has(entry)) continue;

    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      await checkRuleFile(fullPath);
    }
  }
}

async function main(): Promise<void> {
  log.info('Checking built-in rule `since` values...');

  await scanDirectory(rulesDir);

  if (violations.length === 0) {
    log.success('All built-in rules have valid `since` values');
    process.exit(0);
  } else {
    log.error(`Found ${violations.length} violation(s):`);
    for (const v of violations) {
      log.error(`  ${v.file}: ${v.issue}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  log.error(`Unexpected error: ${err}`);
  process.exit(1);
});
