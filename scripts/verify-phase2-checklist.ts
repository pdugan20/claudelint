#!/usr/bin/env ts-node

/**
 * Verify Phase 2 Completion Checklist
 *
 * Checks all items from the completion checklist in IMPLEMENTATION-TRACKER.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  category: string;
  item: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details?: string;
}

const results: CheckResult[] = [];

function check(category: string, item: string, condition: boolean, details?: string) {
  results.push({
    category,
    item,
    status: condition ? 'PASS' : 'FAIL',
    details,
  });
}

console.log('Verifying Phase 2 Completion Checklist...\n');

// Code Quality Checks
console.log('Checking Code Quality...');

// Check for reportError/reportWarning in validators
const validatorFiles = fs.readdirSync('src/validators').filter(f => f.endsWith('.ts'));
let hasReportCalls = false;
for (const file of validatorFiles) {
  const content = fs.readFileSync(path.join('src/validators', file), 'utf-8');
  if (content.match(/\b(reportError|reportWarning)\s*\(/)) {
    hasReportCalls = true;
    break;
  }
}
check('Code Quality', 'Zero reportError/reportWarning calls in validators', !hasReportCalls);

// Check if reportError/reportWarning methods exist in base.ts
const baseContent = fs.readFileSync('src/validators/base.ts', 'utf-8');
const hasReportMethods = baseContent.includes('reportError') || baseContent.includes('reportWarning');
check('Code Quality', 'reportError/reportWarning methods deleted from base.ts', !hasReportMethods);

// Check for stub rules
try {
  execSync('npm run verify:rule-implementations', { stdio: 'pipe' });
  check('Code Quality', 'Zero stub rules (all have real implementations)', true);
} catch {
  check('Code Quality', 'Zero stub rules (all have real implementations)', false);
}

// Testing Checks
console.log('Checking Testing...');

// Run tests and get count
let testsPassing = false;
let testCount = 0;
try {
  const testOutput = execSync('npm test 2>&1', { stdio: 'pipe' }).toString();
  const match = testOutput.match(/Tests:\s+(?:\d+\s+failed,\s*)?(?:\d+\s+skipped,\s*)?(\d+)\s+passed/);
  if (match) {
    testCount = parseInt(match[1]);
    testsPassing = testCount >= 688;
  }
  check('Testing', `All ${testCount}+ tests passing`, testsPassing, `${testCount} tests passing`);
} catch (error: any) {
  // Tests ran but some failed - check output
  const output = error.stdout?.toString() || '';
  const match = output.match(/Tests:\s+\d+\s+failed,\s*(?:\d+\s+skipped,\s*)?(\d+)\s+passed/);
  if (match) {
    testCount = parseInt(match[1]);
  }
  check('Testing', `All ${testCount}+ tests passing`, false, `${testCount} passing, but some failures`);
}

// Check ClaudeLintRuleTester exists
const ruleTesterExists = fs.existsSync('tests/helpers/rule-tester.ts');
check('Testing', 'ClaudeLintRuleTester utility created', ruleTesterExists);

// Check every rule has test file
const ruleFiles = execSync('find src/rules -name "*.ts" ! -name "*.test.ts" ! -name "index.ts" ! -name "rule-ids.ts"', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
let allRulesHaveTests = true;
for (const ruleFile of ruleFiles) {
  const testFile = ruleFile.replace('src/rules', 'tests/rules').replace('.ts', '.test.ts');
  if (!fs.existsSync(testFile)) {
    allRulesHaveTests = false;
    break;
  }
}
check('Testing', 'Every rule has its own test file', allRulesHaveTests, `${ruleFiles.length} rules checked`);

// Check rule structure verification script
const structureScriptExists = fs.existsSync('scripts/check-rule-structure.ts');
check('Testing', 'Rule structure verification script created', structureScriptExists);

// Documentation Checks
console.log('Checking Documentation...');

// Check every rule has docs
let allRulesHaveDocs = true;
for (const ruleFile of ruleFiles) {
  const docFile = ruleFile.replace('src/rules', 'docs/rules').replace('.ts', '.md');
  if (!fs.existsSync(docFile)) {
    allRulesHaveDocs = false;
    break;
  }
}
check('Documentation', 'Every rule has documentation file', allRulesHaveDocs, `${ruleFiles.length} rules checked`);

// Check CHANGELOG updated
const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');
const changelogHasRules = changelogContent.includes('105 rules') || changelogContent.includes('ESLint-style');
check('Documentation', 'CHANGELOG.md updated', changelogHasRules);

// Check contributing guide updated
const contributingContent = fs.readFileSync('docs/contributing-rules.md', 'utf-8');
const contributingUpdated = contributingContent.includes('RuleRegistry.getRulesByCategory') && contributingContent.includes('executeRulesForCategory');
check('Documentation', 'Contributing guide updated', contributingUpdated);

// User Experience Checks
console.log('Checking User Experience...');

// Check if config system works (basic check - config file can be parsed)
const configLoaderExists = fs.existsSync('src/cli/utils/config-loader.ts');
check('User Experience', 'Config system implemented', configLoaderExists);

// Print Results
console.log('\n' + '='.repeat(80));
console.log('PHASE 2 COMPLETION CHECKLIST RESULTS');
console.log('='.repeat(80));
console.log();

const byCategory: Record<string, CheckResult[]> = {};
for (const result of results) {
  if (!byCategory[result.category]) {
    byCategory[result.category] = [];
  }
  byCategory[result.category].push(result);
}

for (const [category, items] of Object.entries(byCategory)) {
  console.log(`${category}:`);
  for (const item of items) {
    const icon = item.status === 'PASS' ? '✓' : '✗';
    const status = item.status === 'PASS' ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${icon} ${item.item}`);
    if (item.details) {
      console.log(`        ${item.details}`);
    }
  }
  console.log();
}

const passed = results.filter(r => r.status === 'PASS').length;
const total = results.length;

console.log('='.repeat(80));
console.log(`Summary: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
console.log('='.repeat(80));

process.exit(passed === total ? 0 : 1);
