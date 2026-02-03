#!/usr/bin/env ts-node
/**
 * Schema Sync Verification
 *
 * Verifies that Zod schemas match their manual JSON Schema references.
 * Runs in two steps:
 * 1. Generate JSON Schemas from Zod definitions
 * 2. Compare generated schemas against manual reference schemas
 *
 * Usage:
 *   npm run check:schema-sync
 *   ts-node scripts/check/schema-sync.ts
 */

import { execSync } from 'child_process';
import chalk from 'chalk';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';

function generateSchemas(): boolean {
  console.log(chalk.bold('Generating JSON Schemas from Zod...\n'));

  try {
    execSync('npm run generate:json-schemas', { stdio: 'inherit' });
    console.log('');
    return true;
  } catch {
    console.error(chalk.red('\nSchema generation failed.\n'));
    return false;
  }
}

function compareSchemas(): boolean {
  console.log(chalk.bold('Comparing schemas...\n'));

  try {
    execSync('npm run verify:schemas', { stdio: 'inherit' });
    return true;
  } catch {
    // verify:schemas exits with code 1 if drift detected
    return false;
  }
}

function main() {
  console.log(chalk.bold('\n=== Schema Sync Verification ===\n'));
  console.log(chalk.gray(`Verifying ${SCHEMA_REGISTRY.length} schemas\n`));

  const generationSuccess = generateSchemas();
  if (!generationSuccess) {
    console.log(chalk.red('Cannot proceed with comparison.\n'));
    process.exit(1);
  }

  const comparisonSuccess = compareSchemas();

  console.log(chalk.bold('\n=== Results ===\n'));

  if (comparisonSuccess) {
    console.log(chalk.green('✓ All schemas match. No drift detected.\n'));
    process.exit(0);
  } else {
    console.log(chalk.red('✗ Schema drift detected.\n'));
    console.log(chalk.yellow('Fix the issues above and run again.\n'));
    process.exit(1);
  }
}

main();
