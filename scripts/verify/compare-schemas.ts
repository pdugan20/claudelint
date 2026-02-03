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

interface SchemaComparison {
  name: string;
  manualPath: string;
  generatedPath: string;
}

const comparisons: SchemaComparison[] = [
  {
    name: 'PluginManifestSchema',
    manualPath: 'schemas/plugin-manifest.schema.json',
    generatedPath: 'schemas/generated/plugin-manifest.generated.json',
  },
  {
    name: 'SkillFrontmatterSchema',
    manualPath: 'schemas/skill-frontmatter.schema.json',
    generatedPath: 'schemas/generated/skill-frontmatter.generated.json',
  },
  {
    name: 'HooksConfigSchema',
    manualPath: 'schemas/hooks-config.schema.json',
    generatedPath: 'schemas/generated/hooks-config.generated.json',
  },
  {
    name: 'MCPConfigSchema',
    manualPath: 'schemas/mcp-config.schema.json',
    generatedPath: 'schemas/generated/mcp-config.generated.json',
  },
  {
    name: 'LSPConfigSchema',
    manualPath: 'schemas/lsp-config.schema.json',
    generatedPath: 'schemas/generated/lsp-config.generated.json',
  },
  {
    name: 'AgentFrontmatterSchema',
    manualPath: 'schemas/agent-frontmatter.schema.json',
    generatedPath: 'schemas/generated/agent-frontmatter.generated.json',
  },
  {
    name: 'OutputStyleFrontmatterSchema',
    manualPath: 'schemas/output-style-frontmatter.schema.json',
    generatedPath: 'schemas/generated/output-style-frontmatter.generated.json',
  },
  {
    name: 'RulesFrontmatterSchema',
    manualPath: 'schemas/rules-frontmatter.schema.json',
    generatedPath: 'schemas/generated/rules-frontmatter.generated.json',
  },
];

interface DriftIssue {
  type: 'missing-field' | 'wrong-type' | 'missing-required' | 'enum-mismatch';
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

function compareSchemas(
  manual: any,
  generated: any,
  basePath: string = ''
): DriftIssue[] {
  const issues: DriftIssue[] = [];

  // Compare required fields
  const manualRequired = manual.required || [];
  const generatedRequired = generated.required || [];

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
  const manualProps = manual.properties || {};
  const generatedProps = generated.properties || {};

  for (const [propName, manualProp] of Object.entries(manualProps)) {
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

    const genProp = generatedProps[propName] as any;
    const manProp = manualProp as any;

    // Compare types
    if (manProp.type && genProp.type && manProp.type !== genProp.type) {
      // Check for oneOf/anyOf which are equivalent to union types
      if (
        !genProp.oneOf &&
        !genProp.anyOf &&
        !manProp.oneOf &&
        !manProp.anyOf
      ) {
        issues.push({
          type: 'wrong-type',
          path: propPath,
          message: `Type mismatch for "${propName}": manual says "${manProp.type}", Zod says "${genProp.type}"`,
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
          issues.push({
            type: 'enum-mismatch',
            path: propPath,
            message: `Enum value "${enumValue}" in manual schema missing from Zod`,
            severity: 'error',
          });
        }
      }
    }

    // Recursively compare nested objects
    if (
      manProp.type === 'object' &&
      genProp.type === 'object' &&
      manProp.properties
    ) {
      const nestedIssues = compareSchemas(manProp, genProp, propPath);
      issues.push(...nestedIssues);
    }

    // Compare array items
    if (
      manProp.type === 'array' &&
      genProp.type === 'array' &&
      manProp.items &&
      genProp.items
    ) {
      // If items is an object schema, compare recursively
      if (
        typeof manProp.items === 'object' &&
        !Array.isArray(manProp.items) &&
        typeof genProp.items === 'object' &&
        !Array.isArray(genProp.items)
      ) {
        const itemPath = `${propPath}[]`;
        const nestedIssues = compareSchemas(
          manProp.items,
          genProp.items,
          itemPath
        );
        issues.push(...nestedIssues);
      }
    }
  }

  return issues;
}

console.log('Comparing manual reference schemas vs generated schemas...\n');

let totalIssues = 0;
let schemasWithDrift = 0;

for (const comparison of comparisons) {
  const manualPath = path.join(__dirname, '../..', comparison.manualPath);
  const generatedPath = path.join(__dirname, '../..', comparison.generatedPath);

  // Check if files exist
  if (!fs.existsSync(manualPath)) {
    console.error(
      `✗ ${comparison.name}: Manual schema not found at ${comparison.manualPath}`
    );
    totalIssues++;
    continue;
  }

  if (!fs.existsSync(generatedPath)) {
    console.error(
      `✗ ${comparison.name}: Generated schema not found. Run "npm run generate:json-schemas" first.`
    );
    totalIssues++;
    continue;
  }

  // Load schemas
  const manual = JSON.parse(fs.readFileSync(manualPath, 'utf-8'));
  const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf-8'));

  // Compare
  const issues = compareSchemas(manual, generated);

  if (issues.length === 0) {
    console.log(`✓ ${comparison.name}: No drift detected`);
  } else {
    console.log(`✗ ${comparison.name}: ${issues.length} issue(s) found\n`);
    schemasWithDrift++;

    for (const issue of issues) {
      const prefix = issue.severity === 'error' ? '  ERROR' : '  WARN';
      console.log(`${prefix}: ${issue.message}`);
      console.log(`         Path: ${issue.path}\n`);
      totalIssues++;
    }
  }
}

console.log('\nSummary:');
console.log(
  `- Schemas compared: ${comparisons.length}`
);
console.log(`- Schemas with drift: ${schemasWithDrift}`);
console.log(`- Total issues: ${totalIssues}`);

if (totalIssues > 0) {
  console.log(
    '\nDrift detected! Fix Zod schemas to match manual reference schemas.'
  );
  process.exit(1);
} else {
  console.log('\nAll schemas match! No drift detected.');
  process.exit(0);
}
