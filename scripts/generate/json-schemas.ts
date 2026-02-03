#!/usr/bin/env ts-node
/**
 * Generate JSON Schemas from Zod schemas
 *
 * This script converts our Zod implementation schemas to JSON Schema format
 * for comparison against manual reference schemas.
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import fs from 'fs';
import path from 'path';

// Import all Zod schemas
import {
  PluginManifestSchema,
  HooksConfigSchema,
  MCPConfigSchema,
} from '../../src/validators/schemas';
import { SkillFrontmatterSchema } from '../../src/schemas/skill-frontmatter.schema';
import { LSPConfigSchema } from '../../src/schemas/lsp-config.schema';
import { AgentFrontmatterSchema } from '../../src/schemas/agent-frontmatter.schema';
import { OutputStyleFrontmatterSchema } from '../../src/schemas/output-style-frontmatter.schema';
import { RulesFrontmatterSchema } from '../../src/schemas/rules-frontmatter.schema';

interface SchemaInfo {
  name: string;
  zodSchema: any;
  outputFile: string;
  description: string;
}

const schemas: SchemaInfo[] = [
  {
    name: 'PluginManifestSchema',
    zodSchema: PluginManifestSchema,
    outputFile: 'plugin-manifest.generated.json',
    description: 'Generated JSON Schema for plugin.json manifest files',
  },
  {
    name: 'SkillFrontmatterSchema',
    zodSchema: SkillFrontmatterSchema,
    outputFile: 'skill-frontmatter.generated.json',
    description: 'Generated JSON Schema for SKILL.md frontmatter',
  },
  {
    name: 'HooksConfigSchema',
    zodSchema: HooksConfigSchema,
    outputFile: 'hooks-config.generated.json',
    description: 'Generated JSON Schema for hooks.json configuration',
  },
  {
    name: 'MCPConfigSchema',
    zodSchema: MCPConfigSchema,
    outputFile: 'mcp-config.generated.json',
    description: 'Generated JSON Schema for .mcp.json configuration',
  },
  {
    name: 'LSPConfigSchema',
    zodSchema: LSPConfigSchema,
    outputFile: 'lsp-config.generated.json',
    description: 'Generated JSON Schema for .lsp.json configuration',
  },
  {
    name: 'AgentFrontmatterSchema',
    zodSchema: AgentFrontmatterSchema,
    outputFile: 'agent-frontmatter.generated.json',
    description: 'Generated JSON Schema for AGENT.md frontmatter',
  },
  {
    name: 'OutputStyleFrontmatterSchema',
    zodSchema: OutputStyleFrontmatterSchema,
    outputFile: 'output-style-frontmatter.generated.json',
    description: 'Generated JSON Schema for OUTPUTSTYLE.md frontmatter',
  },
  {
    name: 'RulesFrontmatterSchema',
    zodSchema: RulesFrontmatterSchema,
    outputFile: 'rules-frontmatter.generated.json',
    description: 'Generated JSON Schema for .claude/rules/*.md frontmatter',
  },
];

const outputDir = path.join(__dirname, '../../schemas/generated');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating JSON Schemas from Zod...\n');

let successCount = 0;
let errorCount = 0;

for (const schemaInfo of schemas) {
  try {
    console.log(`Generating ${schemaInfo.name}...`);

    // Convert Zod to JSON Schema
    const jsonSchema: any = zodToJsonSchema(schemaInfo.zodSchema, {
      name: schemaInfo.name,
      $refStrategy: 'none', // Inline all definitions
    });

    // Extract the actual schema from the wrapper
    // zodToJsonSchema wraps it in { $ref, definitions }, we want the actual definition
    let actualSchema: any;
    if (jsonSchema.definitions && jsonSchema.definitions[schemaInfo.name]) {
      actualSchema = jsonSchema.definitions[schemaInfo.name];
    } else {
      actualSchema = jsonSchema;
    }

    // Build final schema with Draft 2020-12 and our description
    const finalSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      description: schemaInfo.description,
      ...actualSchema,
    };

    // Write to file
    const outputPath = path.join(outputDir, schemaInfo.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(finalSchema, null, 2));

    console.log(`  ✓ Written to ${schemaInfo.outputFile}`);
    successCount++;
  } catch (error) {
    console.error(`  ✗ Error generating ${schemaInfo.name}:`, error);
    errorCount++;
  }
}

console.log(`\nGeneration complete: ${successCount} succeeded, ${errorCount} failed`);

if (errorCount > 0) {
  process.exit(1);
}
