/**
 * Check that all registered rules have corresponding tests
 *
 * Verifies that every rule in the rule registry has a test file.
 * Test files should be at tests/rules/<category>/<rule-name>.test.ts
 *
 * Usage: npm run check:rule-coverage
 */

import * as fs from 'fs';
import * as path from 'path';
import { ALL_RULE_IDS } from '../../src/rules/rule-ids';
import { log } from '../util/logger';

const rootDir = path.join(__dirname, '../..');
const srcRulesDir = path.join(rootDir, 'src/rules');
const testRulesDir = path.join(rootDir, 'tests/rules');

interface CoverageResult {
  totalRules: number;
  rulesWithTests: number;
  rulesWithoutTests: string[];
  testFilesWithoutRules: string[];
}

/**
 * Find the source file for a rule ID
 */
function findRuleSourceFile(ruleId: string): string | null {
  const categories = fs
    .readdirSync(srcRulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const category of categories) {
    const ruleFile = path.join(srcRulesDir, category, `${ruleId}.ts`);
    if (fs.existsSync(ruleFile)) {
      return path.join(category, `${ruleId}.ts`);
    }
  }
  return null;
}

/**
 * Check if a test file exists for a rule
 */
function hasTestFile(ruleId: string): boolean {
  const categories = fs
    .readdirSync(srcRulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const category of categories) {
    const testFile = path.join(testRulesDir, category, `${ruleId}.test.ts`);
    if (fs.existsSync(testFile)) {
      return true;
    }
  }
  return false;
}

/**
 * Find all test files that don't have corresponding rules
 */
function findOrphanedTestFiles(): string[] {
  const orphaned: string[] = [];

  if (!fs.existsSync(testRulesDir)) {
    return orphaned;
  }

  const categories = fs
    .readdirSync(testRulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const category of categories) {
    const categoryDir = path.join(testRulesDir, category);
    const testFiles = fs
      .readdirSync(categoryDir)
      .filter((file) => file.endsWith('.test.ts'));

    for (const testFile of testFiles) {
      const ruleId = testFile.replace('.test.ts', '');
      if (!ALL_RULE_IDS.includes(ruleId as never)) {
        orphaned.push(path.join(category, testFile));
      }
    }
  }

  return orphaned;
}

/**
 * Check rule test coverage
 */
function checkRuleCoverage(): CoverageResult {
  const rulesWithoutTests: string[] = [];
  let rulesWithTests = 0;

  for (const ruleId of ALL_RULE_IDS) {
    if (hasTestFile(ruleId)) {
      rulesWithTests++;
    } else {
      rulesWithoutTests.push(ruleId);
    }
  }

  const testFilesWithoutRules = findOrphanedTestFiles();

  return {
    totalRules: ALL_RULE_IDS.length,
    rulesWithTests,
    rulesWithoutTests,
    testFilesWithoutRules,
  };
}

/**
 * Main execution
 */
function main(): void {
  log.info('Checking rule test coverage...');
  log.blank();

  const result = checkRuleCoverage();

  log.info(`Total rules: ${result.totalRules}`);
  log.info(`Rules with tests: ${result.rulesWithTests}`);
  log.info(
    `Rules without tests: ${result.rulesWithoutTests.length}`
  );
  log.blank();

  if (result.rulesWithoutTests.length > 0) {
    log.info('Rules missing test files:');
    for (const ruleId of result.rulesWithoutTests) {
      const sourceFile = findRuleSourceFile(ruleId);
      log.info(`  - ${ruleId}${sourceFile ? ` (${sourceFile})` : ''}`);
    }
    log.blank();
  }

  if (result.testFilesWithoutRules.length > 0) {
    log.info('Test files without corresponding rules:');
    for (const testFile of result.testFilesWithoutRules) {
      log.info(`  - ${testFile}`);
    }
    log.blank();
  }

  if (
    result.rulesWithoutTests.length === 0 &&
    result.testFilesWithoutRules.length === 0
  ) {
    log.bracket.success('All rules have test coverage!');
    process.exit(0);
  } else {
    log.bracket.fail('Some rules are missing tests or have orphaned test files.');
    process.exit(1);
  }
}

main();
