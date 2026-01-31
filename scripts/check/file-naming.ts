#!/usr/bin/env ts-node
/**
 * File Naming Convention Checker
 *
 * Validates that all files in the project follow the documented naming conventions:
 * - docs/*.md: lowercase-with-hyphens.md
 * - docs/projects/*\/*.md: lowercase-with-hyphens.md (exceptions: README, CHANGELOG, CONTRIBUTING)
 * - docs/rules/{validator}/{rule-id}.md: Must match rule ID exactly
 * - src/**\/*.ts: lowercase-with-hyphens.ts
 * - tests/**\/*.test.ts: lowercase-with-hyphens.test.ts
 */

import { readdir, stat } from 'fs/promises';
import { join, basename, dirname, relative, extname } from 'path';
import { existsSync } from 'fs';

interface Violation {
  file: string;
  issue: string;
  suggestion?: string;
}

const violations: Violation[] = [];
const projectRoot = join(__dirname, '../..');

// Exemptions from naming conventions
const EXEMPT_FILES = new Set([
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'jest.config.js',
  '.eslintrc.json',
  '.prettierrc.json',
  '.gitignore',
  '.npmignore',
]);

/**
 * Check if filename follows lowercase-with-hyphens pattern
 */
function isLowercaseWithHyphens(filename: string): boolean {
  // Handle compound extensions like .schema.ts, .test.ts, .integration.test.ts
  const name = filename
    .replace(/\.(integration|schema)\.test\.ts$/, '')
    .replace(/\.(test|schema|config)\.ts$/, '')
    .replace(/\.(md|ts|js|json)$/, '');

  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

/**
 * Convert filename to lowercase-with-hyphens
 */
function toLowercaseWithHyphens(filename: string): string {
  const ext = extname(filename);
  const name = basename(filename, ext);

  return (
    name
      // Convert camelCase and PascalCase to hyphen-separated
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Convert underscores to hyphens
      .replace(/_/g, '-')
      // Convert to lowercase
      .toLowerCase() + ext
  );
}

/**
 * Recursively walk directory and check files
 */
async function walkDirectory(
  dir: string,
  checker: (file: string, relativePath: string) => Promise<void> | void
): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (error: any) {
    // Skip directories we don't have permission to access (e.g., test fixtures)
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    // Skip node_modules, hidden directories, and __temp__ test directories
    if (entry === 'node_modules' || entry.startsWith('.') || entry === '__temp__') {
      continue;
    }

    let stats;
    try {
      stats = await stat(fullPath);
    } catch (error: any) {
      // Skip files we can't stat (permission issues, etc.)
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        continue;
      }
      throw error;
    }

    if (stats.isDirectory()) {
      await walkDirectory(fullPath, checker);
    } else {
      const relativePath = relative(projectRoot, fullPath);
      await checker(fullPath, relativePath);
    }
  }
}

/**
 * Check docs/*.md files
 */
async function checkMainDocs(): Promise<void> {
  const docsDir = join(projectRoot, 'docs');
  if (!existsSync(docsDir)) return;

  const entries = await readdir(docsDir);

  for (const entry of entries) {
    const fullPath = join(docsDir, entry);
    const stats = await stat(fullPath);

    if (stats.isFile() && entry.endsWith('.md')) {
      // Skip exempt files
      if (EXEMPT_FILES.has(entry)) continue;

      if (!isLowercaseWithHyphens(entry)) {
        violations.push({
          file: `docs/${entry}`,
          issue: 'Main docs must use lowercase-with-hyphens.md',
          suggestion: `Rename to: ${toLowercaseWithHyphens(entry)}`,
        });
      }
    }
  }
}

/**
 * Check docs/projects/*\/*.md files
 */
async function checkProjectDocs(): Promise<void> {
  const projectsDir = join(projectRoot, 'docs', 'projects');
  if (!existsSync(projectsDir)) return;

  await walkDirectory(projectsDir, async (fullPath, relativePath) => {
    const filename = basename(fullPath);

    if (!filename.endsWith('.md')) return;
    if (EXEMPT_FILES.has(filename)) return;

    if (!isLowercaseWithHyphens(filename)) {
      violations.push({
        file: relativePath,
        issue: 'Project docs must use lowercase-with-hyphens.md',
        suggestion: `Rename to: ${toLowercaseWithHyphens(filename)}`,
      });
    }
  });
}

/**
 * Check docs/rules/{validator}/{rule-id}.md files
 */
async function checkRuleDocs(): Promise<void> {
  const rulesDir = join(projectRoot, 'docs', 'rules');
  if (!existsSync(rulesDir)) return;

  // Get all registered rule IDs
  const ruleIdsPath = join(projectRoot, 'src', 'rules', 'rule-ids.ts');
  if (!existsSync(ruleIdsPath)) {
    console.warn('Warning: src/rules/rule-ids.ts not found, skipping rule ID validation');
    return;
  }

  const ruleIdsContent = await import(ruleIdsPath);
  const allRuleIds = ruleIdsContent.ALL_RULE_IDS || [];

  await walkDirectory(rulesDir, async (fullPath, relativePath) => {
    const filename = basename(fullPath);

    if (!filename.endsWith('.md')) return;
    if (filename === 'index.md' || filename === 'TEMPLATE.md') return;

    const ruleId = filename.replace('.md', '');
    const validatorDir = basename(dirname(fullPath));

    // Check if filename is lowercase-with-hyphens
    if (!isLowercaseWithHyphens(filename)) {
      violations.push({
        file: relativePath,
        issue: 'Rule docs must use lowercase-with-hyphens.md matching rule ID',
        suggestion: `Rename to: ${toLowercaseWithHyphens(filename)}`,
      });
    }

    // Check if rule ID exists in registered rules
    if (allRuleIds.length > 0 && !allRuleIds.includes(ruleId)) {
      violations.push({
        file: relativePath,
        issue: `Rule ID "${ruleId}" not found in src/rules/rule-ids.ts`,
        suggestion: `Either add "${ruleId}" to ALL_RULE_IDS or rename the file`,
      });
    }

    // Check if validator directory matches convention
    const validValidators = [
      'claude-md',
      'skills',
      'agents',
      'settings',
      'hooks',
      'mcp',
      'plugin',
      'commands',
      'lsp',
      'output-styles',
    ];

    if (!validValidators.includes(validatorDir)) {
      violations.push({
        file: relativePath,
        issue: `Invalid validator directory "${validatorDir}"`,
        suggestion: `Use one of: ${validValidators.join(', ')}`,
      });
    }
  });
}

/**
 * Check src/**\/*.ts files
 */
async function checkSourceFiles(): Promise<void> {
  const srcDir = join(projectRoot, 'src');
  if (!existsSync(srcDir)) return;

  await walkDirectory(srcDir, async (fullPath, relativePath) => {
    const filename = basename(fullPath);

    if (!filename.endsWith('.ts')) return;

    if (!isLowercaseWithHyphens(filename)) {
      violations.push({
        file: relativePath,
        issue: 'Source files must use lowercase-with-hyphens.ts',
        suggestion: `Rename to: ${toLowercaseWithHyphens(filename)}`,
      });
    }
  });
}

/**
 * Check tests/**\/*.test.ts files
 */
async function checkTestFiles(): Promise<void> {
  const testsDir = join(projectRoot, 'tests');
  if (!existsSync(testsDir)) return;

  await walkDirectory(testsDir, async (fullPath, relativePath) => {
    const filename = basename(fullPath);

    if (!filename.endsWith('.ts')) return;

    if (!isLowercaseWithHyphens(filename)) {
      violations.push({
        file: relativePath,
        issue: 'Test files must use lowercase-with-hyphens.test.ts',
        suggestion: `Rename to: ${toLowercaseWithHyphens(filename)}`,
      });
    }
  });
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Checking file naming conventions...\n');

  await checkMainDocs();
  await checkProjectDocs();
  await checkRuleDocs();
  await checkSourceFiles();
  await checkTestFiles();

  if (violations.length === 0) {
    console.log('[PASS] All files follow naming conventions');
    process.exit(0);
  } else {
    console.log(`[FAIL] Found ${violations.length} naming convention violations:\n`);

    for (const violation of violations) {
      console.log(`  ${violation.file}`);
      console.log(`    Issue: ${violation.issue}`);
      if (violation.suggestion) {
        console.log(`    Suggestion: ${violation.suggestion}`);
      }
      console.log();
    }

    console.log(`\nSee docs/file-naming-conventions.md for details.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
