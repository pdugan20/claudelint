#!/usr/bin/env ts-node
// @ts-nocheck - ts-node has issues with deep Zod type inference, but tsc compiles fine
/**
 * Generate JSON Schemas from Zod schemas
 *
 * This script converts our Zod implementation schemas to JSON Schema format
 * for comparison against manual reference schemas.
 *
 * Uses Zod 4's native z.toJSONSchema() for conversion.
 */

import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';
import { log } from '../util/logger';

const outputDir = path.join(__dirname, '../../schemas/generated');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

log.info('Generating JSON Schemas from Zod...');
log.blank();

let successCount = 0;
let errorCount = 0;

for (const entry of SCHEMA_REGISTRY) {
  try {
    log.info(`Generating ${entry.name}...`);

    // Convert Zod to JSON Schema using Zod 4's native conversion
    const jsonSchema = z.toJSONSchema(entry.zodSchema, {
      unrepresentable: 'any',
    }) as Record<string, unknown>;

    // Build final schema with Draft 2020-12 and our description
    const finalSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      description: entry.description,
      ...jsonSchema,
    };

    // Write to file
    const outputPath = path.join(outputDir, entry.generatedSchemaFile);
    fs.writeFileSync(outputPath, JSON.stringify(finalSchema, null, 2));

    log.pass(`Written to ${entry.generatedSchemaFile}`);
    successCount++;
  } catch (error) {
    log.fail(`Error generating ${entry.name}: ${error}`);
    errorCount++;
  }
}

log.blank();
log.info(`Generation complete: ${successCount} succeeded, ${errorCount} failed`);

if (errorCount > 0) {
  process.exit(1);
}
