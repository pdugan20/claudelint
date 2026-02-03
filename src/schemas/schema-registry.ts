/**
 * Schema Registry - Centralized tracking of official Claude Code schemas
 *
 * This registry maps our internal Zod schemas to their official sources.
 * Used for schema sync verification and documentation.
 */

export interface SchemaSource {
  /** Our internal schema name */
  schema: string;
  /** File where our schema is defined */
  file: string;
  /** Official source URL (if available) */
  officialUrl?: string;
  /** Type of official source */
  sourceType: 'json-schema' | 'documented-spec' | 'inferred' | 'unknown';
  /** Where the official spec is documented */
  docsUrl?: string;
  /** Last verified date (YYYY-MM-DD) */
  lastVerified?: string;
  /** Sync status */
  status: 'verified' | 'needs-audit' | 'out-of-sync' | 'no-official-source';
  /** Notes about the schema or verification status */
  notes?: string;
}

/**
 * Registry of all Claude Code schemas tracked by claudelint
 */
export const SCHEMA_REGISTRY: SchemaSource[] = [
  // Settings
  {
    schema: 'SettingsSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: 'https://json.schemastore.org/claude-code-settings.json',
    sourceType: 'json-schema',
    docsUrl: 'https://code.claude.com/docs/en/settings',
    lastVerified: '2026-02-02',
    status: 'verified',
    notes: 'Verified via npm run check:schema-sync - all tests pass',
  },

  // Plugin Manifest
  {
    schema: 'PluginManifestSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugins-reference#complete-schema',
    lastVerified: '2026-02-02',
    status: 'out-of-sync',
    notes: 'CRITICAL: Missing fields (homepage, keywords, outputStyles, lspServers), wrong types (author should be object, description should be optional)',
  },

  // Hooks (array format for hooks.json)
  {
    schema: 'HooksConfigSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/hooks',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Need to verify event names and hook types match official docs',
  },

  // Hooks (object format for settings.json)
  {
    schema: 'SettingsHooksSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: 'https://json.schemastore.org/claude-code-settings.json',
    sourceType: 'json-schema',
    docsUrl: 'https://code.claude.com/docs/en/hooks',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Part of settings schema, but need to verify all event types',
  },

  // MCP Configuration
  {
    schema: 'MCPConfigSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/mcp',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Need to verify transport types and server schema format',
  },

  // LSP Configuration
  {
    schema: 'LSPConfigSchema',
    file: 'src/schemas/lsp-config.schema.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugins-reference#lsp-servers',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Documented in plugin reference - verify required/optional fields',
  },

  // Skill Frontmatter
  {
    schema: 'SkillFrontmatterSchema',
    file: 'src/schemas/skill-frontmatter.schema.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/skills',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Need to verify frontmatter fields and allowed-tools enum',
  },

  // Agent Frontmatter
  {
    schema: 'AgentFrontmatterSchema',
    file: 'src/schemas/agent-frontmatter.schema.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugins-reference#agents',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Plugin docs show example with description and capabilities fields',
  },

  // Rules File Frontmatter (.claude/rules/*.md)
  {
    schema: 'RulesFrontmatterSchema',
    file: 'src/schemas/rules-frontmatter.schema.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/memory#path-specific-rules',
    lastVerified: '2026-02-02',
    status: 'verified',
    notes: 'Frontmatter for .claude/rules/*.md files with paths field for scoping rules to specific file patterns',
  },

  // Output Style Frontmatter
  {
    schema: 'OutputStyleFrontmatterSchema',
    file: 'src/schemas/output-style-frontmatter.schema.ts',
    officialUrl: undefined,
    sourceType: 'unknown',
    docsUrl: undefined,
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Need to find official documentation for output styles',
  },

  // Marketplace Metadata
  {
    schema: 'MarketplaceMetadataSchema',
    file: 'src/validators/schemas.ts',
    officialUrl: undefined,
    sourceType: 'documented-spec',
    docsUrl: 'https://code.claude.com/docs/en/plugin-marketplaces',
    lastVerified: undefined,
    status: 'needs-audit',
    notes: 'Need to verify marketplace.json schema from plugin marketplace docs',
  },
];

/**
 * Get schema source info by schema name
 */
export function getSchemaSource(schemaName: string): SchemaSource | undefined {
  return SCHEMA_REGISTRY.find((s) => s.schema === schemaName);
}

/**
 * Get all schemas that need auditing
 */
export function getSchemasNeedingAudit(): SchemaSource[] {
  return SCHEMA_REGISTRY.filter((s) => s.status === 'needs-audit');
}

/**
 * Get all schemas that are out of sync
 */
export function getSchemasOutOfSync(): SchemaSource[] {
  return SCHEMA_REGISTRY.filter((s) => s.status === 'out-of-sync');
}

/**
 * Get all schemas with official JSON Schema URLs
 */
export function getSchemasWithOfficialUrls(): SchemaSource[] {
  return SCHEMA_REGISTRY.filter((s) => s.officialUrl !== undefined);
}

/**
 * Get schemas by source type
 */
export function getSchemasBySourceType(
  sourceType: SchemaSource['sourceType']
): SchemaSource[] {
  return SCHEMA_REGISTRY.filter((s) => s.sourceType === sourceType);
}
