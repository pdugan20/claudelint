#!/usr/bin/env ts-node
/**
 * Source Path Validation Script
 *
 * Scans website markdown files for backtick-wrapped source path references
 * (e.g., `src/utils/cache.ts`) and verifies each path exists on disk.
 * Catches stale, renamed, or mistyped source references in documentation.
 *
 * Skips fenced code blocks (illustrative examples) and template placeholders.
 *
 * Exits with error if any broken source path references are found.
 */

import { existsSync } from 'fs';
import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  path: string;
  snippet: string;
}

const projectRoot = join(__dirname, '../..');

const SOURCE_PREFIXES = [
  'src/',
  'scripts/',
  'tests/',
  'schemas/',
  'bin/',
  'presets/',
  'skills/',
  'website/',
];

/**
 * Directories to skip entirely
 */
const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  '.vitepress',
  'cache',
  'public',
]);

/**
 * Paths used in documentation that don't exist on disk.
 * Includes illustrative examples and build-generated directories.
 */
const EXAMPLE_PATHS = new Set([
  'scripts/deploy.sh',
  'schemas/generated',
]);

/**
 * Regex to extract backtick-wrapped source paths from a line.
 * Captures the content inside backticks that starts with a known prefix.
 */
const BACKTICK_PATH_RE = new RegExp(
  '`((?:' + SOURCE_PREFIXES.map((p) => p.replace('/', '\\/')).join('|') + ')[^`]+)`',
  'g'
);

/**
 * True when a path should be skipped (template placeholder, glob, variable).
 */
function shouldSkip(path: string): boolean {
  return /[{}<>*]/.test(path);
}

/**
 * Clean trailing punctuation that isn't part of the actual path.
 */
function cleanPath(raw: string): string {
  return raw.replace(/[),:;.]+$/, '').replace(/\/+$/, '');
}

/**
 * Scan a file for broken source path references.
 */
async function scanFile(filePath: string, relPath: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');

  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block state
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    // Reset regex lastIndex for each line
    BACKTICK_PATH_RE.lastIndex = 0;
    let match;
    while ((match = BACKTICK_PATH_RE.exec(line)) !== null) {
      const rawPath = match[1];
      if (shouldSkip(rawPath)) continue;

      const cleaned = cleanPath(rawPath);
      if (!cleaned) continue;
      if (EXAMPLE_PATHS.has(cleaned)) continue;

      const fullPath = join(projectRoot, cleaned);
      if (!existsSync(fullPath)) {
        violations.push({
          file: relPath,
          line: i + 1,
          path: cleaned,
          snippet: line.trim().substring(0, 100),
        });
      }
    }
  }

  return violations;
}

/**
 * Recursively scan directory for markdown files.
 */
async function scanDir(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir);

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    if (entry.startsWith('.')) continue;

    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      files.push(...(await scanDir(fullPath)));
    } else if (entry.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main(): Promise<void> {
  log.info('Checking for broken source path references in website docs...');
  log.blank();

  const violations: Violation[] = [];

  const webFiles = await scanDir(join(projectRoot, 'website'));
  for (const file of webFiles) {
    const relPath = relative(projectRoot, file);
    // Skip auto-generated rule pages (regenerated from source metadata)
    if (/^website\/rules\/[^/]+\/[^/]+\.md$/.test(relPath) && !relPath.endsWith('overview.md')) {
      continue;
    }
    violations.push(...(await scanFile(file, relPath)));
  }

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} broken source path reference(s):`);
    log.blank();

    for (const v of violations) {
      log.info(`  ${v.file}:${v.line}`);
      log.info(`    Referenced: \`${v.path}\` (not found on disk)`);
      log.dim(`    ${v.snippet}`);
      log.blank();
    }

    log.info('Update or remove these references.');
    process.exit(1);
  } else {
    log.bracket.success('All source path references are valid');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${String(error)}`);
  process.exit(1);
});
