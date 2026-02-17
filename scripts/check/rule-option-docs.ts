#!/usr/bin/env ts-node

/**
 * Check that rule options in code match documentation
 *
 * Validates:
 * 1. Rules with options in code have documented options
 * 2. Documented options match code implementation
 * 3. Default values match between code and docs
 */

import * as fs from 'fs';
import * as path from 'path';
import { log } from '../util/logger';

interface RuleOptions {
  ruleId: string;
  hasOptions: boolean;
  options: string[];
  defaults: Record<string, any>;
  filePath: string;
}

interface DocOptions {
  ruleId: string;
  hasOptionsSection: boolean;
  saysNoOptions: boolean;
  documentedOptions: string[];
  filePath: string;
}

interface Mismatch {
  ruleId: string;
  issue: string;
  severity: 'error' | 'warning';
}

/**
 * Parse rule implementation to extract options
 */
function parseRuleImplementation(filePath: string): RuleOptions | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ruleId = path.basename(filePath, '.ts');

  // Check if rule has schema and defaultOptions
  const hasSchema = /schema:\s*z\.object\(/m.test(content);
  const hasDefaultOptions = /defaultOptions:\s*\{/m.test(content);

  if (!hasSchema && !hasDefaultOptions) {
    return {
      ruleId,
      hasOptions: false,
      options: [],
      defaults: {},
      filePath,
    };
  }

  // Extract option names from schema
  const options: string[] = [];
  const schemaMatch = content.match(/schema:\s*z\.object\(\{([^}]+)\}\)/s);
  if (schemaMatch) {
    const schemaBody = schemaMatch[1];
    const optionMatches = schemaBody.matchAll(/(\w+):/g);
    for (const match of optionMatches) {
      options.push(match[1]);
    }
  }

  // Extract default values
  const defaults: Record<string, any> = {};
  const defaultsMatch = content.match(/defaultOptions:\s*\{([^}]+)\}/s);
  if (defaultsMatch) {
    const defaultsBody = defaultsMatch[1];
    const valueMatches = defaultsBody.matchAll(/(\w+):\s*([^,\n]+)/g);
    for (const match of valueMatches) {
      const key = match[1];
      let value = match[2].trim();

      // Clean up the value
      value = value.replace(/\/\/.*$/, '').trim(); // Remove comments

      // Try to parse the value
      try {
        if (value === 'true') defaults[key] = true;
        else if (value === 'false') defaults[key] = false;
        else if (!isNaN(Number(value))) defaults[key] = Number(value);
        else defaults[key] = value.replace(/['"]/g, ''); // Remove quotes
      } catch {
        defaults[key] = value;
      }
    }
  }

  return {
    ruleId,
    hasOptions: hasSchema || hasDefaultOptions,
    options,
    defaults,
    filePath,
  };
}

/**
 * Parse rule documentation to extract options
 */
function parseRuleDocumentation(filePath: string): DocOptions | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const ruleId = path.basename(filePath, '.md');

  const hasOptionsSection = /^## Options$/m.test(content);

  // Check if doc says "no options"
  const saysNoOptions = /does not have (any )?configuration options/i.test(content);

  // Extract documented option names (look for ### `optionName`)
  const documentedOptions: string[] = [];
  const optionMatches = content.matchAll(/^### `(\w+)`$/gm);
  for (const match of optionMatches) {
    documentedOptions.push(match[1]);
  }

  return {
    ruleId,
    hasOptionsSection,
    saysNoOptions,
    documentedOptions,
    filePath,
  };
}

/**
 * Compare implementation and documentation
 */
function findMismatches(
  implementation: RuleOptions,
  documentation: DocOptions
): Mismatch[] {
  const mismatches: Mismatch[] = [];
  const ruleId = implementation.ruleId;

  // Case 1: Rule has options in code but doc says "no options"
  if (implementation.hasOptions && documentation.saysNoOptions) {
    mismatches.push({
      ruleId,
      issue: `Has options in code (${implementation.options.join(', ')}) but documentation says "no options"`,
      severity: 'error',
    });
  }

  // Case 2: Rule has options in code but no Options section in docs
  if (implementation.hasOptions && !documentation.hasOptionsSection) {
    mismatches.push({
      ruleId,
      issue: `Has options in code (${implementation.options.join(', ')}) but missing Options section in documentation`,
      severity: 'error',
    });
  }

  // Case 3: Options in code not documented
  if (implementation.hasOptions && documentation.hasOptionsSection && !documentation.saysNoOptions) {
    for (const option of implementation.options) {
      if (!documentation.documentedOptions.includes(option)) {
        mismatches.push({
          ruleId,
          issue: `Option "${option}" exists in code but not documented`,
          severity: 'error',
        });
      }
    }
  }

  // Case 4: Documented options not in code
  if (documentation.documentedOptions.length > 0) {
    for (const option of documentation.documentedOptions) {
      if (!implementation.options.includes(option)) {
        mismatches.push({
          ruleId,
          issue: `Option "${option}" is documented but not in code`,
          severity: 'warning',
        });
      }
    }
  }

  // Case 5: Doc says no options but code has options (reverse of case 1)
  if (!implementation.hasOptions && documentation.documentedOptions.length > 0) {
    mismatches.push({
      ruleId,
      issue: `Documentation has options (${documentation.documentedOptions.join(', ')}) but code has no options`,
      severity: 'error',
    });
  }

  return mismatches;
}

/**
 * Find all rule files
 */
function findRuleFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findRuleFiles(fullPath));
    } else if (
      entry.name.endsWith('.ts') &&
      !entry.name.endsWith('.test.ts') &&
      entry.name !== 'index.ts' &&
      entry.name !== 'rule-ids.ts'
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  const rulesDir = path.join(__dirname, '../../src/rules');
  const docsDir = path.join(__dirname, '../../website/rules');

  log.info('Checking rule options vs documentation...');
  log.blank();

  // Find all rule implementations
  const ruleFiles = findRuleFiles(rulesDir);
  log.info(`Found ${ruleFiles.length} rule implementations`);
  log.blank();

  const allMismatches: Mismatch[] = [];
  let checked = 0;
  let matched = 0;

  for (const ruleFile of ruleFiles) {
    const implementation = parseRuleImplementation(ruleFile);
    if (!implementation) continue;

    // Find corresponding documentation
    const category = path.basename(path.dirname(ruleFile));
    const docFile = path.join(docsDir, category, `${implementation.ruleId}.md`);

    if (!fs.existsSync(docFile)) {
      allMismatches.push({
        ruleId: implementation.ruleId,
        issue: 'Documentation file not found',
        severity: 'error',
      });
      continue;
    }

    const documentation = parseRuleDocumentation(docFile);
    if (!documentation) continue;

    checked++;

    const mismatches = findMismatches(implementation, documentation);
    if (mismatches.length === 0) {
      matched++;
    } else {
      allMismatches.push(...mismatches);
    }
  }

  // Report results
  log.divider();
  log.bold('OPTION/DOCUMENTATION SYNC CHECK');
  log.divider();
  log.blank();
  log.info(`Rules checked: ${checked}`);
  log.info(`Matched: ${matched}`);
  log.info(`With issues: ${checked - matched}`);
  log.blank();

  if (allMismatches.length === 0) {
    log.pass('All rule options are properly documented!');
    log.blank();
    process.exit(0);
  }

  // Group by severity
  const errors = allMismatches.filter(m => m.severity === 'error');
  const warnings = allMismatches.filter(m => m.severity === 'warning');

  log.divider();
  log.bold('ISSUES FOUND');
  log.divider();
  log.blank();

  if (errors.length > 0) {
    log.info(`ERRORS (${errors.length}):`);
    log.blank();
    for (const error of errors) {
      log.bracket.fail(error.ruleId);
      log.info(`       ${error.issue}`);
      log.blank();
    }
  }

  if (warnings.length > 0) {
    log.info(`WARNINGS (${warnings.length}):`);
    log.blank();
    for (const warning of warnings) {
      log.bracket.warn(warning.ruleId);
      log.info(`       ${warning.issue}`);
      log.blank();
    }
  }

  // Exit with error if there are errors
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
