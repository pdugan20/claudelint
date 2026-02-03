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
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';
import { log } from '../util/logger';

function generateSchemas(): boolean {
  log.bold('Generating JSON Schemas from Zod...');
  log.blank();

  try {
    execSync('npm run generate:json-schemas', { stdio: 'inherit' });
    log.blank();
    return true;
  } catch {
    log.blank();
    log.error('Schema generation failed.');
    log.blank();
    return false;
  }
}

function compareSchemas(): boolean {
  log.bold('Comparing schemas...');
  log.blank();

  try {
    execSync('npm run verify:schemas', { stdio: 'inherit' });
    return true;
  } catch {
    // verify:schemas exits with code 1 if drift detected
    return false;
  }
}

function main() {
  log.section('=== Schema Sync Verification ===');
  log.dim(`Verifying ${SCHEMA_REGISTRY.length} schemas`);
  log.blank();

  const generationSuccess = generateSchemas();
  if (!generationSuccess) {
    log.error('Cannot proceed with comparison.');
    log.blank();
    process.exit(1);
  }

  const comparisonSuccess = compareSchemas();

  log.section('=== Results ===');

  if (comparisonSuccess) {
    log.pass('All schemas match. No drift detected.');
    log.blank();
    process.exit(0);
  } else {
    log.fail('Schema drift detected.');
    log.warn('Fix the issues above and run again.');
    log.blank();
    process.exit(1);
  }
}

main();
