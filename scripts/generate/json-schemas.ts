#!/usr/bin/env ts-node
// @ts-nocheck - ts-node has issues with deep Zod type inference, but tsc compiles fine
/**
 * Generate JSON Schemas from Zod schemas
 *
 * This script converts our Zod implementation schemas to JSON Schema format
 * for comparison against manual reference schemas.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import type { JSONSchema7 } from 'json-schema';
import fs from 'fs';
import path from 'path';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';

const outputDir = path.join(__dirname, '../../schemas/generated');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating JSON Schemas from Zod...\n');

let successCount = 0;
let errorCount = 0;

for (const entry of SCHEMA_REGISTRY) {
  try {
    console.log(`Generating ${entry.name}...`);

    // Convert Zod to JSON Schema
    const jsonSchema = zodToJsonSchema(entry.zodSchema, {
      name: entry.name,
      $refStrategy: 'none', // Inline all definitions
    }) as JSONSchema7 & { definitions?: Record<string, JSONSchema7> };

    // Extract the actual schema from the wrapper
    // zodToJsonSchema wraps it in { $ref, definitions }, we want the actual definition
    let actualSchema: JSONSchema7;
    if (jsonSchema.definitions?.[entry.name]) {
      actualSchema = jsonSchema.definitions[entry.name];
    } else {
      actualSchema = jsonSchema;
    }

    // Build final schema with Draft 2020-12 and our description
    const finalSchema: JSONSchema7 = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      description: entry.description,
      ...actualSchema,
    };

    // Write to file
    const outputPath = path.join(outputDir, entry.generatedSchemaFile);
    fs.writeFileSync(outputPath, JSON.stringify(finalSchema, null, 2));

    console.log(`  ✓ Written to ${entry.generatedSchemaFile}`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Error generating ${entry.name}:`, error);
    errorCount++;
  }
}

console.log(`\nGeneration complete: ${successCount} succeeded, ${errorCount} failed`);

if (errorCount > 0) {
  process.exit(1);
}
