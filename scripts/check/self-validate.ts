#!/usr/bin/env ts-node
/**
 * Self-Validation Script
 *
 * Runs claudelint on our own project files to ensure we follow our own rules.
 * Validates:
 * - .claude-plugin/plugin.json
 * - skills/
 * - .claude/settings.json (if exists)
 *
 * This is the "shoemaker's children have shoes" check - we should dogfood our own linter.
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { log } from '../util/logger';
import { fileExists } from '../../src/utils/filesystem/files';

interface ValidationResult {
  validator: string;
  exitCode: number;
  output: string;
}

const results: ValidationResult[] = [];

/**
 * Run claudelint validator
 */
function runValidator(
  validatorName: string,
  args: string[] = []
): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const proc = spawn('npx', ['claudelint', `validate-${validatorName}`, ...args], {
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
        validator: validatorName,
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
  log.info('Running self-validation checks...');
  log.info('(Dogfooding our own linter)');
  log.blank();
  log.divider();
  log.blank();

  // Always validate plugin.json
  log.info('Validating .claude-plugin/plugin.json...');
  const pluginResult = await runValidator('plugin', ['--verbose']);
  results.push(pluginResult);

  // Always validate skills
  log.blank();
  log.info('Validating skills/...');
  const skillsResult = await runValidator('skills', ['--verbose']);
  results.push(skillsResult);

  // Validate settings if it exists
  const settingsPath = join(__dirname, '../../.claude/settings.json');
  if (await fileExists(settingsPath)) {
    log.blank();
    log.info('Validating .claude/settings.json...');
    const settingsResult = await runValidator('settings', ['--verbose']);
    results.push(settingsResult);
  }

  // Print summary
  log.blank();
  log.divider();
  log.bold('SELF-VALIDATION SUMMARY');
  log.divider();
  log.blank();

  const passed = results.filter((r) => r.exitCode === 0);
  const failed = results.filter((r) => r.exitCode !== 0);

  for (const result of results) {
    if (result.exitCode === 0) {
      log.info(`  [PASS]  validate-${result.validator}`);
    } else {
      log.info(`  [FAIL]  validate-${result.validator}`);
    }
  }

  log.blank();
  log.info(`Total: ${passed.length}/${results.length} validators passed`);

  if (failed.length > 0) {
    log.blank();
    log.info('Failed validators:');
    for (const result of failed) {
      log.info(`  - validate-${result.validator}`);
    }
    log.blank();
    log.info('Fix all violations before committing.');
    log.info('We must follow our own rules!');
    process.exit(1);
  } else {
    log.blank();
    log.info('All self-validation checks passed!');
    log.info('Our project follows its own rules.');
    process.exit(0);
  }
}

main().catch((error) => {
  log.error(`Error: ${error}`);
  process.exit(1);
});
