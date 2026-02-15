#!/usr/bin/env ts-node
/**
 * Verify rule structure: 1:1:1 mapping between rules, tests, and docs
 *
 * Ensures every rule has:
 * - A test file at tests/rules/{category}/{rule-id}.test.ts
 * - A doc file at website/rules/{category}/{rule-id}.md
 *
 * Prevents orphaned test/doc files (file exists but no rule)
 */

import * as fs from 'fs';
import { glob } from 'glob';
import { log } from '../util/logger';

interface RuleFile {
  id: string;
  category: string;
  filePath: string;
}

interface ValidationResult {
  missingTests: RuleFile[];
  missingDocs: RuleFile[];
  orphanedTests: string[];
  orphanedDocs: string[];
}

/**
 * Get all rule files
 */
function getRuleFiles(): RuleFile[] {
  const ruleFiles = glob.sync('src/rules/**/*.ts', {
    ignore: ['**/index.ts', '**/rule-ids.ts'],
  });

  return ruleFiles.map((filePath) => {
    const parts = filePath.split('/');
    const category = parts[2]; // src/rules/{category}/*.ts
    const fileName = parts[parts.length - 1];
    const id = fileName.replace('.ts', '');

    return { id, category, filePath };
  });
}

/**
 * Get all test files
 */
function getTestFiles(): string[] {
  return glob.sync('tests/rules/**/*.test.ts');
}

/**
 * Get all doc files
 */
function getDocFiles(): string[] {
  return glob.sync('website/rules/**/*.md', {
    ignore: ['**/TEMPLATE.md', '**/index.md'],
  });
}

/**
 * Check if test file exists for rule
 */
function hasTestFile(rule: RuleFile): boolean {
  const testPath = `tests/rules/${rule.category}/${rule.id}.test.ts`;
  return fs.existsSync(testPath);
}

/**
 * Check if doc file exists for rule
 */
function hasDocFile(rule: RuleFile): boolean {
  const docPath = `website/rules/${rule.category}/${rule.id}.md`;
  return fs.existsSync(docPath);
}

/**
 * Check if rule file exists for test
 */
function hasRuleForTest(testPath: string): boolean {
  const match = testPath.match(/tests\/rules\/([^/]+)\/([^/]+)\.test\.ts$/);
  if (!match) return true; // Ignore malformed paths

  const [, category, id] = match;
  const rulePath = `src/rules/${category}/${id}.ts`;
  return fs.existsSync(rulePath);
}

/**
 * Check if rule file exists for doc
 */
function hasRuleForDoc(docPath: string): boolean {
  const match = docPath.match(/website\/rules\/([^/]+)\/([^/]+)\.md$/);
  if (!match) return true; // Ignore malformed paths

  const [, category, id] = match;
  const rulePath = `src/rules/${category}/${id}.ts`;
  return fs.existsSync(rulePath);
}

/**
 * Validate rule structure
 */
function validateRuleStructure(): ValidationResult {
  const rules = getRuleFiles();
  const testFiles = getTestFiles();
  const docFiles = getDocFiles();

  const missingTests: RuleFile[] = [];
  const missingDocs: RuleFile[] = [];

  // Check each rule has test and doc
  for (const rule of rules) {
    if (!hasTestFile(rule)) {
      missingTests.push(rule);
    }
    if (!hasDocFile(rule)) {
      missingDocs.push(rule);
    }
  }

  // Check for orphaned test files
  const orphanedTests = testFiles.filter((testPath) => !hasRuleForTest(testPath));

  // Check for orphaned doc files
  const orphanedDocs = docFiles.filter((docPath) => !hasRuleForDoc(docPath));

  return {
    missingTests,
    missingDocs,
    orphanedTests,
    orphanedDocs,
  };
}

/**
 * Print error messages
 */
function printErrors(result: ValidationResult): void {
  if (result.missingTests.length > 0) {
    log.blank();
    log.bracket.error('Rules missing test files:');
    for (const rule of result.missingTests) {
      log.info(`   ${rule.filePath}`);
      log.info(`   Expected: tests/rules/${rule.category}/${rule.id}.test.ts`);
    }
  }

  if (result.missingDocs.length > 0) {
    log.blank();
    log.bracket.error('Rules missing documentation files:');
    for (const rule of result.missingDocs) {
      log.info(`   ${rule.filePath}`);
      log.info(`   Expected: website/rules/${rule.category}/${rule.id}.md`);
    }
  }

  if (result.orphanedTests.length > 0) {
    log.blank();
    log.bracket.error('Orphaned test files (no corresponding rule):');
    for (const testPath of result.orphanedTests) {
      log.info(`   ${testPath}`);
    }
  }

  if (result.orphanedDocs.length > 0) {
    log.blank();
    log.bracket.error('Orphaned documentation files (no corresponding rule):');
    for (const docPath of result.orphanedDocs) {
      log.info(`   ${docPath}`);
    }
  }
}

/**
 * Main
 */
function main(): void {
  log.info('Checking rule structure (1:1:1 mapping)...');
  log.blank();

  const result = validateRuleStructure();
  const totalErrors =
    result.missingTests.length +
    result.missingDocs.length +
    result.orphanedTests.length +
    result.orphanedDocs.length;

  if (totalErrors === 0) {
    log.bracket.success('All rules have test files and documentation');
    log.bracket.success('No orphaned test or documentation files');
    log.blank();
    process.exit(0);
  }

  log.error('Rule structure validation failed:');
  printErrors(result);
  log.blank();
  log.info('Summary:');
  log.info(`  ${result.missingTests.length} rules missing tests`);
  log.info(`  ${result.missingDocs.length} rules missing docs`);
  log.info(`  ${result.orphanedTests.length} orphaned test files`);
  log.info(`  ${result.orphanedDocs.length} orphaned doc files`);
  log.blank();
  log.info(`Total: ${totalErrors} violations`);
  log.blank();

  process.exit(1);
}

main();
