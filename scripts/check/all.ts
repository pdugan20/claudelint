#!/usr/bin/env ts-node
/**
 * Aggregate Validation Script
 *
 * Runs all validation checks in sequence:
 * 1. File naming conventions
 * 2. Rule ID registration
 * 3. Rule documentation completeness
 * 4. Code/documentation consistency
 *
 * Exits with error if any check fails.
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { log } from '../util/logger';

interface CheckResult {
  name: string;
  exitCode: number;
  output: string;
}

const results: CheckResult[] = [];

/**
 * Run a script and capture output
 */
function runScript(scriptPath: string, name: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const proc = spawn('ts-node', [scriptPath], {
      cwd: join(__dirname, '../..'),
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    let output = '';

    proc.stdout.on('data', (data) => {
      const str = data.toString();
      output += str;
      process.stdout.write(str);
    });

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      output += str;
      process.stderr.write(str);
    });

    proc.on('close', (code) => {
      resolve({
        name,
        exitCode: code || 0,
        output,
      });
    });
  });
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  log.info('Running all validation checks...');
  log.blank();
  log.divider();
  log.blank();

  const checks = [
    { script: join(__dirname, 'file-naming.ts'), name: 'File Naming' },
    { script: join(__dirname, 'rule-ids.ts'), name: 'Rule IDs' },
    { script: join(__dirname, 'rule-docs.ts'), name: 'Rule Documentation' },
    { script: join(__dirname, 'consistency.ts'), name: 'Consistency' },
  ];

  // Run each check
  for (const check of checks) {
    log.blank();
    log.divider();
    log.info(`Running: ${check.name}`);
    log.divider();
    log.blank();

    const result = await runScript(check.script, check.name);
    results.push(result);

    if (result.exitCode !== 0) {
      log.blank();
      log.bracket.fail(`${check.name} FAILED`);
    } else {
      log.blank();
      log.bracket.success(`${check.name} PASSED`);
    }
  }

  // Print summary
  log.blank();
  log.divider();
  log.bold('SUMMARY');
  log.divider();
  log.blank();

  const passed = results.filter((r) => r.exitCode === 0);
  const failed = results.filter((r) => r.exitCode !== 0);

  for (const result of results) {
    if (result.exitCode === 0) {
      log.info(`  [PASS]  ${result.name}`);
    } else {
      log.info(`  [FAIL]  ${result.name}`);
    }
  }

  log.blank();
  log.info(`Total: ${passed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    log.blank();
    log.info('Failed checks:');
    for (const result of failed) {
      log.info(`  - ${result.name}`);
    }
    log.blank();
    log.info('Fix all violations before committing.');
    process.exit(1);
  } else {
    log.blank();
    log.info('All validation checks passed!');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
