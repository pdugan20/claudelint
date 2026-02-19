/**
 * Schema Registry - Single Source of Truth
 *
 * Centralized registry of all Claude Code schemas validated by claudelint.
 * Used by generation, comparison, and verification scripts.
 */

import { z } from 'zod';

// Import all Zod schemas
import {
  PluginManifestSchema,
  HooksConfigSchema,
  MCPConfigSchema,
  MarketplaceMetadataSchema,
} from '../validators/schemas';
import { SkillFrontmatterSchema } from './skill-frontmatter.schema';
import { LSPConfigSchema } from './lsp-config.schema';
import { AgentFrontmatterSchema } from './agent-frontmatter.schema';
import { OutputStyleFrontmatterSchema } from './output-style-frontmatter.schema';
import { RulesFrontmatterSchema } from './rules-frontmatter.schema';

export interface SchemaRegistryEntry {
  /** Display name of the schema */
  name: string;

  /** Zod schema definition */
  zodSchema: z.ZodTypeAny;

  /** Filename for manual reference schema (in schemas/) */
  manualSchemaFile: string;

  /** Filename for generated schema (in schemas/generated/) */
  generatedSchemaFile: string;

  /** Description for generated JSON Schema */
  description: string;

  /** URL to official Claude Code documentation */
  officialDocsUrl: string;
}

/**
 * Registry of all schemas
 *
 * To add a new schema:
 * 1. Import the Zod schema
 * 2. Add an entry to this array
 * 3. Create the manual reference schema in schemas/
 * 4. Run: npm run generate:json-schemas
 * 5. Run: npm run check:schema-sync
 */
export const SCHEMA_REGISTRY: SchemaRegistryEntry[] = [
  {
    name: 'PluginManifestSchema',
    zodSchema: PluginManifestSchema,
    manualSchemaFile: 'plugin-manifest.schema.json',
    generatedSchemaFile: 'plugin-manifest.generated.json',
    description: 'Generated JSON Schema for plugin.json manifest files',
    officialDocsUrl: 'https://code.claude.com/docs/en/plugins-reference#plugin-manifest-schema',
  },
  {
    name: 'SkillFrontmatterSchema',
    zodSchema: SkillFrontmatterSchema,
    manualSchemaFile: 'skill-frontmatter.schema.json',
    generatedSchemaFile: 'skill-frontmatter.generated.json',
    description: 'Generated JSON Schema for SKILL.md frontmatter',
    officialDocsUrl: 'https://code.claude.com/docs/en/skills#frontmatter-reference',
  },
  {
    name: 'HooksConfigSchema',
    zodSchema: HooksConfigSchema,
    manualSchemaFile: 'hooks-config.schema.json',
    generatedSchemaFile: 'hooks-config.generated.json',
    description: 'Generated JSON Schema for hooks.json configuration',
    officialDocsUrl: 'https://code.claude.com/docs/en/hooks',
  },
  {
    name: 'MCPConfigSchema',
    zodSchema: MCPConfigSchema,
    manualSchemaFile: 'mcp-config.schema.json',
    generatedSchemaFile: 'mcp-config.generated.json',
    description: 'Generated JSON Schema for .mcp.json configuration',
    officialDocsUrl: 'https://code.claude.com/docs/en/mcp',
  },
  {
    name: 'LSPConfigSchema',
    zodSchema: LSPConfigSchema,
    manualSchemaFile: 'lsp-config.schema.json',
    generatedSchemaFile: 'lsp-config.generated.json',
    description: 'Generated JSON Schema for .lsp.json configuration',
    officialDocsUrl: 'https://code.claude.com/docs/en/plugins-reference#lsp-servers',
  },
  {
    name: 'AgentFrontmatterSchema',
    zodSchema: AgentFrontmatterSchema,
    manualSchemaFile: 'agent-frontmatter.schema.json',
    generatedSchemaFile: 'agent-frontmatter.generated.json',
    description: 'Generated JSON Schema for agent frontmatter',
    officialDocsUrl: 'https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields',
  },
  {
    name: 'OutputStyleFrontmatterSchema',
    zodSchema: OutputStyleFrontmatterSchema,
    manualSchemaFile: 'output-style-frontmatter.schema.json',
    generatedSchemaFile: 'output-style-frontmatter.generated.json',
    description: 'Generated JSON Schema for output style frontmatter',
    officialDocsUrl: 'https://code.claude.com/docs/en/output-styles#frontmatter',
  },
  {
    name: 'RulesFrontmatterSchema',
    zodSchema: RulesFrontmatterSchema,
    manualSchemaFile: 'rules-frontmatter.schema.json',
    generatedSchemaFile: 'rules-frontmatter.generated.json',
    description: 'Generated JSON Schema for .claude/rules/*.md frontmatter',
    officialDocsUrl: 'https://code.claude.com/docs/en/memory#path-specific-rules',
  },
  {
    name: 'MarketplaceMetadataSchema',
    zodSchema: MarketplaceMetadataSchema,
    manualSchemaFile: 'marketplace.schema.json',
    generatedSchemaFile: 'marketplace.generated.json',
    description: 'Generated JSON Schema for marketplace.json configuration',
    officialDocsUrl: 'https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema',
  },
];
