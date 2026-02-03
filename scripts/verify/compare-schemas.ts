#!/usr/bin/env ts-node
/**
 * Compare manual reference schemas against generated schemas
 *
 * This script compares our manual JSON Schema references (source of truth from docs)
 * against JSON Schemas generated from Zod (our implementation).
 *
 * Rules:
 * - Zod can be STRICTER than docs (extra validations OK)
 * - Zod cannot be LOOSER than docs (missing required fields BAD)
 * - Field types must match exactly
 * - Required fields must match exactly
 */

import fs from 'fs';
import path from 'path';
import type { JSONSchema7 } from 'json-schema';
import { SCHEMA_REGISTRY } from '../../src/schemas/registry';
import { log } from '../util/logger';

interface DriftIssue {
  type: 'missing-field' | 'wrong-type' | 'missing-required' | 'enum-mismatch';
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

function compareSchemas(
  manual: JSONSchema7,
  generated: JSONSchema7,
  basePath = ''
): DriftIssue[] {
  const issues: DriftIssue[] = [];

  // Compare required fields
  const manualRequired = manual.required ?? [];
  const generatedRequired = generated.required ?? [];

  for (const field of manualRequired) {
    if (!generatedRequired.includes(field)) {
      issues.push({
        type: 'missing-required',
        path: basePath ? `${basePath}.${field}` : field,
        message: `Required field "${field}" in manual schema is not required in Zod`,
        severity: 'error',
      });
    }
  }

  // Compare properties
  const manualProps = manual.properties ?? {};
  const generatedProps = generated.properties ?? {};

  for (const [propName, manualPropDef] of Object.entries(manualProps)) {
    const propPath = basePath ? `${basePath}.${propName}` : propName;

    // Check if field exists in generated
    if (!(propName in generatedProps)) {
      issues.push({
        type: 'missing-field',
        path: propPath,
        message: `Field "${propName}" exists in manual schema but missing in Zod`,
        severity: 'error',
      });
      continue;
    }

    // Skip if property definition is boolean (true means any schema is valid)
    if (typeof manualPropDef === 'boolean' || typeof generatedProps[propName] === 'boolean') {
      continue;
    }

    const genProp = generatedProps[propName];
    const manProp = manualPropDef;

    // Type guard - both should be JSONSchema7 objects at this point
    if (typeof genProp !== 'object' || typeof manProp !== 'object') {
      continue;
    }

    // Compare types
    if (manProp.type && genProp.type && manProp.type !== genProp.type) {
      // Check for oneOf/anyOf which are equivalent to union types
      if (!genProp.oneOf && !genProp.anyOf && !manProp.oneOf && !manProp.anyOf) {
        const manualType = Array.isArray(manProp.type) ? manProp.type.join('|') : manProp.type;
        const generatedType = Array.isArray(genProp.type) ? genProp.type.join('|') : genProp.type;
        issues.push({
          type: 'wrong-type',
          path: propPath,
          message: `Type mismatch for "${propName}": manual says "${manualType}", Zod says "${generatedType}"`,
          severity: 'error',
        });
      }
    }

    // Compare enums
    if (manProp.enum && genProp.enum) {
      const manualEnums = new Set(manProp.enum);
      const generatedEnums = new Set(genProp.enum);

      // Check if all manual enums are in generated
      for (const enumValue of manualEnums) {
        if (!generatedEnums.has(enumValue)) {
          // Handle different enum value types (string, number, boolean, null)
          const valueStr =
            enumValue === null
              ? 'null'
              : typeof enumValue === 'object'
                ? JSON.stringify(enumValue)
                : String(enumValue);
          issues.push({
            type: 'enum-mismatch',
            path: propPath,
            message: `Enum value "${valueStr}" in manual schema missing from Zod`,
            severity: 'error',
          });
        }
      }
    }

    // Recursively compare nested objects
    if (manProp.type === 'object' && genProp.type === 'object' && manProp.properties) {
      const nestedIssues = compareSchemas(manProp, genProp, propPath);
      issues.push(...nestedIssues);
    }

    // Compare array items
    if (manProp.type === 'array' && genProp.type === 'array' && manProp.items && genProp.items) {
      // If items is an object schema (not array or boolean), compare recursively
      if (
        typeof manProp.items === 'object' &&
        !Array.isArray(manProp.items) &&
        typeof genProp.items === 'object' &&
        !Array.isArray(genProp.items) &&
        manProp.items !== null &&
        genProp.items !== null
      ) {
        const itemPath = `${propPath}[]`;
        const nestedIssues = compareSchemas(manProp.items, genProp.items, itemPath);
        issues.push(...nestedIssues);
      }
    }
  }

  return issues;
}

log.info('Comparing manual reference schemas vs generated schemas...');
log.blank();

let totalIssues = 0;
let schemasWithDrift = 0;

for (const entry of SCHEMA_REGISTRY) {
  const manualPath = path.join(__dirname, '../..', 'schemas', entry.manualSchemaFile);
  const generatedPath = path.join(__dirname, '../..', 'schemas/generated', entry.generatedSchemaFile);

  // Check if files exist
  if (!fs.existsSync(manualPath)) {
    log.fail(`${entry.name}: Manual schema not found at ${entry.manualSchemaFile}`);
    totalIssues++;
    continue;
  }

  if (!fs.existsSync(generatedPath)) {
    log.fail(
      `${entry.name}: Generated schema not found. Run "npm run generate:json-schemas" first.`
    );
    totalIssues++;
    continue;
  }

  // Load schemas
  const manual = JSON.parse(fs.readFileSync(manualPath, 'utf-8')) as JSONSchema7;
  const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf-8')) as JSONSchema7;

  // Compare
  const issues = compareSchemas(manual, generated);

  if (issues.length === 0) {
    log.pass(`${entry.name}: No drift detected`);
  } else {
    log.fail(`${entry.name}: ${issues.length} issue(s) found`);
    log.blank();
    schemasWithDrift++;

    for (const issue of issues) {
      const prefix = issue.severity === 'error' ? '  ERROR' : '  WARN';
      log.info(`${prefix}: ${issue.message}`);
      log.info(`         Path: ${issue.path}`);
      log.blank();
      totalIssues++;
    }
  }
}

log.blank();
log.info('Summary:');
log.info(`- Schemas compared: ${SCHEMA_REGISTRY.length}`);
log.info(`- Schemas with drift: ${schemasWithDrift}`);
log.info(`- Total issues: ${totalIssues}`);

if (totalIssues > 0) {
  log.blank();
  log.info('Drift detected! Fix Zod schemas to match manual reference schemas.');
  process.exit(1);
} else {
  log.blank();
  log.info('All schemas match! No drift detected.');
  process.exit(0);
}
