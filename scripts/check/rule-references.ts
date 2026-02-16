#!/usr/bin/env ts-node
/**
 * Rule Reference Validation Script
 *
 * Scans source and website files for references to rule IDs and verifies
 * they exist in the canonical ALL_RULE_IDS list. Catches stale references
 * to deleted or renamed rules.
 *
 * Only flags references that start with a known rule category prefix
 * (e.g., `skill-`, `agent-`, `claude-md-`) to avoid false positives
 * from frontmatter field names, tool names, etc.
 *
 * Exits with error if any invalid rule references are found.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';
import { ALL_RULE_IDS } from '../../src/rules/rule-ids';

interface Violation {
  file: string;
  line: number;
  ruleId: string;
  snippet: string;
}

const projectRoot = join(__dirname, '../..');
const ruleIdSet = new Set<string>(ALL_RULE_IDS);

/**
 * Known rule category prefixes. A backtick-quoted kebab-case string
 * is only treated as a rule reference if it starts with one of these.
 */
const RULE_CATEGORY_PREFIXES = [
  'agent-',
  'claude-md-',
  'commands-',
  'hooks-',
  'lsp-',
  'mcp-',
  'output-style-',
  'plugin-',
  'settings-',
  'skill-',
];

/**
 * Known placeholder/example rule IDs used in docs that aren't real.
 */
const PLACEHOLDER_IDS = new Set([
  'skill-missing-changelog', // referenced as relatedRules example in template
]);

/**
 * Directories to skip entirely
 */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'docs', // Frozen legacy
  '.git',
  '.claudelint-cache',
  'cache',
  'coverage',
]);

/**
 * Extract backtick-quoted rule IDs from a line of text.
 * Only matches strings starting with a known category prefix.
 */
function extractRuleIdReferences(line: string): string[] {
  const matches: string[] = [];
  const regex = /`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const candidate = match[1];
    // Only consider candidates that start with a known rule category prefix
    if (RULE_CATEGORY_PREFIXES.some((prefix) => candidate.startsWith(prefix))) {
      matches.push(candidate);
    }
  }
  return matches;
}

/**
 * Scan a file for invalid rule ID references
 */
async function scanFile(filePath: string, relPath: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  let inCodeBlock = false;
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block state
    if (line.trimStart().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.trimStart().slice(3).trim();
      } else {
        inCodeBlock = false;
        codeBlockLang = '';
      }
      continue;
    }

    // Skip JSON/YAML code blocks (config examples with illustrative rule IDs)
    if (inCodeBlock && ['json', 'jsonc', 'yaml', 'yml'].includes(codeBlockLang)) {
      continue;
    }

    const refs = extractRuleIdReferences(line);
    for (const ref of refs) {
      if (PLACEHOLDER_IDS.has(ref)) continue;
      if (ruleIdSet.has(ref)) continue;

      violations.push({
        file: relPath,
        line: i + 1,
        ruleId: ref,
        snippet: line.trim().substring(0, 100),
      });
    }
  }

  return violations;
}

/**
 * Recursively scan directory for files to check
 */
async function scanDir(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir);

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    if (entry.startsWith('.') && entry !== '.claude') continue;

    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      files.push(...(await scanDir(fullPath, extensions)));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main(): Promise<void> {
  log.info('Checking for stale rule ID references...');
  log.blank();

  const violations: Violation[] = [];

  // Scan source files (.ts)
  const srcFiles = await scanDir(join(projectRoot, 'src'), ['.ts']);
  for (const file of srcFiles) {
    const relPath = relative(projectRoot, file);
    // Skip auto-generated files
    if (relPath.includes('rule-ids.ts') || relPath.endsWith('src/rules/index.ts')) continue;
    violations.push(...(await scanFile(file, relPath)));
  }

  // Scan website files (.md), skip auto-generated rule docs (they mirror source)
  const webFiles = await scanDir(join(projectRoot, 'website'), ['.md']);
  for (const file of webFiles) {
    const relPath = relative(projectRoot, file);
    // Skip auto-generated rule pages (fixed by fixing source + regenerating)
    if (/^website\/rules\/[^/]+\/[^/]+\.md$/.test(relPath) && !relPath.endsWith('overview.md')) {
      continue;
    }
    violations.push(...(await scanFile(file, relPath)));
  }

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} stale rule reference(s):`);
    log.blank();

    for (const v of violations) {
      log.info(`  ${v.file}:${v.line}`);
      log.info(`    Referenced: \`${v.ruleId}\` (does not exist)`);
      log.dim(`    ${v.snippet}`);
      log.blank();
    }

    log.info('Update or remove these references to existing rule IDs.');
    process.exit(1);
  } else {
    log.bracket.success('No stale rule references found');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${String(error)}`);
  process.exit(1);
});
