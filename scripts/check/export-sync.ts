#!/usr/bin/env ts-node
/**
 * Export / Documentation Sync Check
 *
 * Verifies that the documented helper functions in
 * website/development/helper-library.md match the actual exports
 * from src/utils/index.ts (the `claude-code-lint/utils` barrel).
 *
 * Catches:
 * - Functions documented but not exported (broken docs)
 * - Functions exported but not documented (missing docs)
 *
 * Exits with error if any drift is found.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { log } from '../util/logger';

const projectRoot = join(__dirname, '../..');

const BARREL_PATH = join(projectRoot, 'src/utils/index.ts');
const DOCS_PATH = join(projectRoot, 'website/development/helper-library.md');

function extractBarrelExports(source: string): Set<string> {
  const exports = new Set<string>();

  // Match named exports: export { foo, bar } from '...'
  const namedExportRe = /export\s*\{([^}]+)\}\s*from/g;
  for (const match of source.matchAll(namedExportRe)) {
    const names = match[1].split(',').map((s) => s.trim());
    for (const name of names) {
      // Skip type-only exports and empty strings
      if (name && !name.startsWith('type ')) {
        exports.add(name);
      }
    }
  }

  return exports;
}

function extractDocumentedFunctions(source: string): Set<string> {
  const functions = new Set<string>();

  // Match import statements in code blocks: import { foo, bar } from 'claudelint/utils'
  const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]claude(?:-code)?lint\/utils['"]/g;
  for (const match of source.matchAll(importRe)) {
    const names = match[1].split(',').map((s) => s.trim());
    for (const name of names) {
      if (name && !name.startsWith('type ')) {
        functions.add(name);
      }
    }
  }

  // Match ### headings that document functions: ### functionName(...)
  const headingRe = /^###\s+(\w+)\(/gm;
  for (const match of source.matchAll(headingRe)) {
    functions.add(match[1]);
  }

  return functions;
}

function main(): void {
  log.section('Export / Documentation Sync Check');

  const barrelSource = readFileSync(BARREL_PATH, 'utf-8');
  const docsSource = readFileSync(DOCS_PATH, 'utf-8');

  const barrelExports = extractBarrelExports(barrelSource);
  const documentedFunctions = extractDocumentedFunctions(docsSource);

  // Only check functions (not constants/regexes) against docs
  // Constants like HEADING_RE, SEMVER_RE are exports but not necessarily
  // documented as standalone sections in the helper library
  const barrelFunctions = new Set(
    [...barrelExports].filter((name) => /^[a-z]/.test(name))
  );

  let errors = 0;

  // Check: documented but not exported
  for (const fn of documentedFunctions) {
    if (!barrelFunctions.has(fn)) {
      log.fail(`Documented but not exported: ${fn}`);
      errors++;
    }
  }

  // Check: exported but not documented
  for (const fn of barrelFunctions) {
    if (!documentedFunctions.has(fn)) {
      log.fail(`Exported but not documented: ${fn}`);
      errors++;
    }
  }

  if (errors > 0) {
    log.blank();
    log.bracket.fail(
      `${errors} export/documentation drift(s) found. ` +
        'Update src/utils/index.ts or website/development/helper-library.md.'
    );
    process.exit(1);
  }

  log.pass(`${barrelFunctions.size} functions in sync between barrel and docs`);
  log.bracket.success('Export/docs sync check passed');
}

main();
