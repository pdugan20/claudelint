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
      cwd: join(__dirname, '..'),
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
  console.log('Running all validation checks...\n');
  console.log('='.repeat(80));
  console.log();

  const checks = [
    { script: join(__dirname, 'check-file-naming.ts'), name: 'File Naming' },
    { script: join(__dirname, 'check-rule-ids.ts'), name: 'Rule IDs' },
    { script: join(__dirname, 'audit-rule-docs.ts'), name: 'Rule Documentation' },
    { script: join(__dirname, 'check-consistency.ts'), name: 'Consistency' },
  ];

  // Run each check
  for (const check of checks) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Running: ${check.name}`);
    console.log('='.repeat(80));
    console.log();

    const result = await runScript(check.script, check.name);
    results.push(result);

    if (result.exitCode !== 0) {
      console.log(`\n[FAIL] ${check.name} FAILED`);
    } else {
      console.log(`\n[PASS] ${check.name} PASSED`);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log();

  const passed = results.filter((r) => r.exitCode === 0);
  const failed = results.filter((r) => r.exitCode !== 0);

  for (const result of results) {
    const status = result.exitCode === 0 ? '[PASS]' : '[FAIL]';
    console.log(`  ${status}  ${result.name}`);
  }

  console.log();
  console.log(`Total: ${passed.length}/${results.length} checks passed`);

  if (failed.length > 0) {
    console.log();
    console.log('Failed checks:');
    for (const result of failed) {
      console.log(`  - ${result.name}`);
    }
    console.log();
    console.log('Fix all violations before committing.');
    process.exit(1);
  } else {
    console.log();
    console.log('All validation checks passed!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
