#!/usr/bin/env ts-node
/**
 * Rule ID Validator
 *
 * Validates that:
 * 1. All rule IDs used in reportError/reportWarning calls are registered in rule-ids.ts
 * 2. All registered rule IDs are actually used in validators
 * 3. No duplicate rule IDs exist
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';

interface Violation {
  file: string;
  line?: number;
  issue: string;
  ruleId?: string;
}

const violations: Violation[] = [];
const warnings: Violation[] = [];
const projectRoot = join(__dirname, '../..');

// Track all rule IDs found in code
const usedRuleIds = new Set<string>();
const ruleIdLocations = new Map<string, { file: string; line: number }[]>();

/**
 * Extract rule IDs from source file
 */
async function extractRuleIds(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Match reportError and reportWarning calls with rule IDs
  // Examples:
  //   this.reportError('message', file, line, 'rule-id')
  //   this.reportWarning('message', file, undefined, 'rule-id')
  const ruleIdPattern = /\.(reportError|reportWarning)\([^)]*,\s*['"`]([a-z-]+)['"`]\s*\)/g;

  // Track if we're inside a multi-line comment
  let inComment = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Check for comment start/end
    if (trimmed.includes('/*')) inComment = true;
    if (trimmed.includes('*/')) {
      inComment = false;
      return; // Skip the line with closing comment
    }

    // Skip lines inside comments or single-line comments
    if (inComment || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      return;
    }

    let match;
    while ((match = ruleIdPattern.exec(line)) !== null) {
      const ruleId = match[2];
      usedRuleIds.add(ruleId);

      if (!ruleIdLocations.has(ruleId)) {
        ruleIdLocations.set(ruleId, []);
      }
      ruleIdLocations.get(ruleId)!.push({
        file: relativePath,
        line: index + 1,
      });
    }
  });
}

/**
 * Recursively scan validators directory
 */
async function scanValidators(): Promise<void> {
  const validatorsDir = join(projectRoot, 'src', 'validators');
  if (!existsSync(validatorsDir)) {
    throw new Error('src/validators directory not found');
  }

  const entries = await readdir(validatorsDir);

  for (const entry of entries) {
    const fullPath = join(validatorsDir, entry);
    const stats = await stat(fullPath);

    if (stats.isFile() && entry.endsWith('.ts')) {
      await extractRuleIds(fullPath);
    }
  }
}

/**
 * Load registered rule IDs from rule-ids.ts
 */
async function loadRegisteredRuleIds(): Promise<Set<string>> {
  const ruleIdsPath = join(projectRoot, 'src', 'rules', 'rule-ids.ts');

  if (!existsSync(ruleIdsPath)) {
    throw new Error('src/rules/rule-ids.ts not found');
  }

  // Dynamically import the module
  const ruleIdsModule = await import(ruleIdsPath);
  const allRuleIds: readonly string[] = ruleIdsModule.ALL_RULE_IDS || [];

  return new Set(allRuleIds);
}

/**
 * Check for unregistered rule IDs
 */
function checkUnregisteredRuleIds(registeredRuleIds: Set<string>): void {
  for (const ruleId of usedRuleIds) {
    if (!registeredRuleIds.has(ruleId)) {
      const locations = ruleIdLocations.get(ruleId) || [];
      const primaryLocation = locations[0];

      violations.push({
        file: primaryLocation.file,
        line: primaryLocation.line,
        issue: `Unregistered rule ID "${ruleId}" used in code`,
        ruleId,
      });

      // Show all locations where this rule ID is used
      if (locations.length > 1) {
        locations.slice(1).forEach((loc) => {
          violations.push({
            file: loc.file,
            line: loc.line,
            issue: `  Also used here`,
            ruleId,
          });
        });
      }
    }
  }
}

/**
 * Check for orphaned rule IDs (registered but not used)
 */
function checkOrphanedRuleIds(registeredRuleIds: Set<string>): void {
  for (const ruleId of registeredRuleIds) {
    if (!usedRuleIds.has(ruleId)) {
      warnings.push({
        file: 'src/rules/rule-ids.ts',
        issue: `Orphaned rule ID "${ruleId}" is registered but never used`,
        ruleId,
      });
    }
  }
}

/**
 * Check for duplicate rule IDs in type definitions
 */
async function checkDuplicates(): Promise<void> {
  const ruleIdsPath = join(projectRoot, 'src', 'rules', 'rule-ids.ts');
  const content = await readFile(ruleIdsPath, 'utf-8');
  const lines = content.split('\n');

  // Extract all rule IDs from type definitions
  const typeRuleIds = new Map<string, number[]>();
  const ruleIdPattern = /^\s*\|\s*['"`]([a-z-]+)['"`]/;

  lines.forEach((line, index) => {
    const match = line.match(ruleIdPattern);
    if (match) {
      const ruleId = match[1];
      if (!typeRuleIds.has(ruleId)) {
        typeRuleIds.set(ruleId, []);
      }
      typeRuleIds.get(ruleId)!.push(index + 1);
    }
  });

  // Check for duplicates in type definitions
  for (const [ruleId, lineNumbers] of typeRuleIds) {
    if (lineNumbers.length > 1) {
      violations.push({
        file: 'src/rules/rule-ids.ts',
        line: lineNumbers[0],
        issue: `Duplicate rule ID "${ruleId}" in type definition`,
        ruleId,
      });
      lineNumbers.slice(1).forEach((lineNum) => {
        violations.push({
          file: 'src/rules/rule-ids.ts',
          line: lineNum,
          issue: `  Also defined here`,
          ruleId,
        });
      });
    }
  }

  // Extract all rule IDs from ALL_RULE_IDS array
  const arrayRuleIds = new Map<string, number[]>();
  const arrayPattern = /^\s*['"`]([a-z-]+)['"`],?\s*(\/\/.*)?$/;

  lines.forEach((line, index) => {
    const match = line.match(arrayPattern);
    if (match) {
      const ruleId = match[1];
      if (!arrayRuleIds.has(ruleId)) {
        arrayRuleIds.set(ruleId, []);
      }
      arrayRuleIds.get(ruleId)!.push(index + 1);
    }
  });

  // Check for duplicates in array
  for (const [ruleId, lineNumbers] of arrayRuleIds) {
    if (lineNumbers.length > 1) {
      violations.push({
        file: 'src/rules/rule-ids.ts',
        line: lineNumbers[0],
        issue: `Duplicate rule ID "${ruleId}" in ALL_RULE_IDS array`,
        ruleId,
      });
      lineNumbers.slice(1).forEach((lineNum) => {
        violations.push({
          file: 'src/rules/rule-ids.ts',
          line: lineNum,
          issue: `  Also defined here`,
          ruleId,
        });
      });
    }
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('Checking rule ID registration...\n');

  // Scan validators for used rule IDs
  await scanValidators();

  // Load registered rule IDs
  const registeredRuleIds = await loadRegisteredRuleIds();

  // Check for duplicates
  await checkDuplicates();

  // Check for unregistered rule IDs
  checkUnregisteredRuleIds(registeredRuleIds);

  // Check for orphaned rule IDs
  checkOrphanedRuleIds(registeredRuleIds);

  // Report results
  let hasErrors = false;

  if (violations.length > 0) {
    console.log(`[FAIL] Found ${violations.length} rule ID violations:\n`);
    for (const violation of violations) {
      const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
      console.log(`  ${location}`);
      console.log(`    ${violation.issue}`);
      if (violation.ruleId) {
        console.log(`    Suggestion: Add "${violation.ruleId}" to src/rules/rule-ids.ts`);
      }
      console.log();
    }
    hasErrors = true;
  }

  if (warnings.length > 0) {
    console.log(`[WARN] Found ${warnings.length} warnings:\n`);
    for (const warning of warnings) {
      console.log(`  ${warning.file}`);
      console.log(`    ${warning.issue}`);
      if (warning.ruleId) {
        console.log(`    Consider: Remove "${warning.ruleId}" from rule-ids.ts or implement the rule`);
      }
      console.log();
    }
  }

  if (!hasErrors && warnings.length === 0) {
    console.log('[PASS] All rule IDs are properly registered');
    console.log(`  Used rule IDs: ${usedRuleIds.size}`);
    console.log(`  Registered rule IDs: ${registeredRuleIds.size}`);
  }

  // Exit with error if violations found
  if (hasErrors) {
    console.log('Fix violations before committing.');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('Warnings found but allowing commit.');
    process.exit(0);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
