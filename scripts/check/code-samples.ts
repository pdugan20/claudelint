#!/usr/bin/env ts-node
/**
 * Code Sample Consistency Check
 *
 * Scans website documentation for JavaScript/CommonJS code samples that
 * should use TypeScript/ESM. Prevents JS from creeping back into docs
 * after the TypeScript migration.
 *
 * Checks for:
 * - Code fences tagged ```javascript or ```js (should be ```typescript or ```ts)
 * - module.exports usage inside code fences
 * - require() calls inside code fences
 *
 * Files can opt out with an HTML comment: <!-- claudelint-allow-js -->
 *
 * Exits with error if any violations are found.
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { log } from '../util/logger';

interface Violation {
  file: string;
  line: number;
  issue: string;
  snippet: string;
}

const projectRoot = join(__dirname, '../..');

const SKIP_DIRS = new Set(['node_modules', '.vitepress', '_sidebar.json']);

async function scanFile(filePath: string, relPath: string): Promise<Violation[]> {
  const violations: Violation[] = [];
  const content = await readFile(filePath, 'utf-8');

  // Check for opt-out comment
  if (content.includes('<!-- claudelint-allow-js -->')) {
    return violations;
  }

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Track code block state
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim().toLowerCase();

        // Check for JavaScript code fence language
        if (codeBlockLang === 'javascript' || codeBlockLang === 'js') {
          violations.push({
            file: relPath,
            line: i + 1,
            issue: `Code fence uses \`${codeBlockLang}\` instead of \`typescript\``,
            snippet: trimmed,
          });
        }
      } else {
        inCodeBlock = false;
        codeBlockLang = '';
      }
      continue;
    }

    // Only check inside code blocks (not prose)
    if (!inCodeBlock) continue;

    // Skip non-JS/TS code blocks
    if (!['javascript', 'js', 'typescript', 'ts', ''].includes(codeBlockLang)) continue;

    // Check for CommonJS patterns
    if (trimmed.includes('module.exports')) {
      violations.push({
        file: relPath,
        line: i + 1,
        issue: 'Code sample uses `module.exports` instead of ES module `export`',
        snippet: trimmed.substring(0, 80),
      });
    }

    if (/\brequire\s*\(/.test(trimmed) && !trimmed.startsWith('//')) {
      violations.push({
        file: relPath,
        line: i + 1,
        issue: 'Code sample uses `require()` instead of ES module `import`',
        snippet: trimmed.substring(0, 80),
      });
    }
  }

  return violations;
}

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
  log.info('Checking documentation code samples...');
  log.blank();

  const websiteDir = join(projectRoot, 'website');
  const files = await scanDir(websiteDir);
  const violations: Violation[] = [];

  for (const file of files) {
    const relPath = relative(projectRoot, file);
    violations.push(...(await scanFile(file, relPath)));
  }

  if (violations.length > 0) {
    log.bracket.fail(`Found ${violations.length} JavaScript code sample(s) in docs:`);
    log.blank();

    for (const v of violations) {
      log.info(`  ${v.file}:${v.line}`);
      log.info(`    ${v.issue}`);
      log.dim(`    ${v.snippet}`);
      log.blank();
    }

    log.info('Use TypeScript/ESM syntax in documentation code samples.');
    log.info('Add <!-- claudelint-allow-js --> to exempt a file.');
    process.exit(1);
  } else {
    log.bracket.success(`All ${files.length} documentation files use TypeScript code samples`);
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${String(error)}`);
  process.exit(1);
});
