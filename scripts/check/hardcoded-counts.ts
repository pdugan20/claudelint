#!/usr/bin/env ts-node
/**
 * Hardcoded Rule Count Checker
 *
 * Scans markdown and documentation files for hardcoded rule counts
 * that will go stale as rules are added or removed.
 *
 * Website files should use <RuleCount> components.
 * Non-website docs should use approximate language ("100+ rules").
 * Generated files are allowlisted.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  content: string;
  issue: string;
}

const projectRoot = join(__dirname, '../..');
const violations: Violation[] = [];

/**
 * Paths that are allowlisted (generated or historical files)
 */
const ALLOWLISTED_PATHS = [
  'website/data/rule-stats.json',
  'website/rules/_sidebar.json',
  'src/rules/rule-ids.ts',
  'src/rules/index.ts',
  'docs/projects/',
  'CHANGELOG.md',
  'node_modules/',
  '.claude/',
];

/**
 * Patterns that match hardcoded rule counts
 */
const COUNT_PATTERNS = [
  /\b(\d+)\s+(?:validation\s+)?rules?\b/gi,
  /\b(\d+)\s+rules?\s+total\b/gi,
];

/**
 * Check if a line should be excluded from detection
 */
function isExcludedLine(line: string): boolean {
  // Lines using the RuleCount component
  if (line.includes('<RuleCount')) return true;
  // Inline disable escape hatch
  if (line.includes('claudelint-allow-counts')) return true;
  return false;
}

/**
 * Check if a file path is allowlisted
 */
function isAllowlisted(filePath: string): boolean {
  return ALLOWLISTED_PATHS.some((p) => filePath.startsWith(p));
}

/**
 * Determine if a line index falls inside a fenced code block
 */
function buildCodeBlockMap(lines: string[]): boolean[] {
  const inCodeBlock: boolean[] = new Array(lines.length).fill(false);
  let inside = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith('```')) {
      inside = !inside;
      inCodeBlock[i] = true; // The fence line itself is "inside"
    } else {
      inCodeBlock[i] = inside;
    }
  }

  return inCodeBlock;
}

/**
 * Scan a single file for hardcoded counts
 */
async function scanFile(filePath: string): Promise<void> {
  const relativePath = relative(projectRoot, filePath);

  if (isAllowlisted(relativePath)) return;

  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const codeBlockMap = buildCodeBlockMap(lines);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines inside code blocks
    if (codeBlockMap[i]) continue;

    // Skip excluded lines
    if (isExcludedLine(line)) continue;

    for (const pattern of COUNT_PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        const count = parseInt(match[1], 10);

        // Only flag counts >= 2 (avoid false positives on "1 rule")
        if (count < 2) continue;

        violations.push({
          file: relativePath,
          line: i + 1,
          content: line.trim(),
          issue: `Hardcoded rule count "${match[0]}" found. Use <RuleCount> in website/ or generic language in docs/.`,
        });
      }
    }
  }
}

/**
 * Recursively find all markdown files
 */
async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const results: string[] = [];

  const entries = await readdir(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);

    // Skip node_modules and .git
    if (entry === 'node_modules' || entry === '.git' || entry === '.claude') continue;

    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      results.push(...(await findFiles(fullPath, extensions)));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info('Checking for hardcoded rule counts...');
  log.blank();

  // Scan markdown files and TypeScript files with comments
  const files = await findFiles(projectRoot, ['.md', '.ts']);

  for (const file of files) {
    await scanFile(file);
  }

  // Report results
  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} hardcoded rule count(s):`);
    log.blank();
    for (const v of violations) {
      log.info(`  ${v.file}:${v.line}`);
      log.info(`    ${v.content}`);
      log.info(`    ${v.issue}`);
      log.blank();
    }
    log.info('Fix: Use <RuleCount category="..." /> in website/ files,');
    log.info('or remove exact counts from docs/ files.');
    log.info('To allowlist a line, add <!-- claudelint-allow-counts --> to it.');
    process.exit(1);
  } else {
    log.bracket.success('No hardcoded rule counts found');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
