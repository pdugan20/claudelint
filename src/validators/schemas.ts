/**
 * Shared Zod schemas for validators
 */

import { z } from 'zod';

/**
 * Matcher schema for hooks
 */
export const MatcherSchema = z.object({
  tool: z.string().optional(),
  pattern: z.string().optional(),
});

/**
 * Hook schema (used in both settings and hooks validators)
 */
export const HookSchema = z.object({
  event: z.string(),
  matcher: MatcherSchema.optional(),
  type: z.enum(['command', 'prompt', 'agent']),
  command: z.string().optional(),
  prompt: z.string().optional(),
  agent: z.string().optional(),
  exitCodeHandling: z
    .object({
      0: z.string().optional(),
      1: z.string().optional(),
      2: z.string().optional(),
    })
    .optional(),
});

/**
 * Permission rule schema for settings
 */
export const PermissionRuleSchema = z.object({
  tool: z.string(),
  action: z.enum(['allow', 'ask', 'deny']),
  pattern: z.string().optional(),
});

/**
 * Attribution schema for settings
 */
export const AttributionSchema = z.object({
  enabled: z.boolean().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
});

/**
 * Sandbox schema for settings
 */
export const SandboxSchema = z.object({
  enabled: z.boolean().optional(),
  allowedCommands: z.array(z.string()).optional(),
});

/**
 * Marketplace source schema for settings
 */
export const MarketplaceSourceSchema = z.object({
  source: z.string(),
  repo: z.string().optional(),
  branch: z.string().optional(),
  tag: z.string().optional(),
});

/**
 * Marketplace config schema for settings
 */
export const MarketplaceConfigSchema = z.object({
  source: MarketplaceSourceSchema,
  enabled: z.boolean().optional(),
});

/**
 * Complete settings schema
 */
export const SettingsSchema = z.object({
  permissions: z.array(PermissionRuleSchema).optional(),
  env: z.record(z.string()).optional(),
  model: z.enum(['sonnet', 'opus', 'haiku', 'inherit']).optional(),
  apiKeyHelper: z.string().optional(),
  hooks: z.array(HookSchema).optional(),
  attribution: AttributionSchema.optional(),
  statusLine: z.string().optional(),
  outputStyle: z.string().optional(),
  sandbox: SandboxSchema.optional(),
  enabledPlugins: z.record(z.boolean()).optional(),
  extraKnownMarketplaces: z.record(MarketplaceConfigSchema).optional(),
  strictKnownMarketplaces: z.boolean().optional(),
});

/**
 * Hooks config schema
 */
export const HooksConfigSchema = z.object({
  hooks: z.array(HookSchema),
});

/**
 * MCP stdio transport schema
 */
export const MCPStdioTransportSchema = z.object({
  type: z.literal('stdio'),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
});

/**
 * MCP SSE transport schema
 */
export const MCPSSETransportSchema = z.object({
  type: z.literal('sse'),
  url: z.string(),
  env: z.record(z.string()).optional(),
});

/**
 * MCP server schema
 */
export const MCPServerSchema = z.object({
  name: z.string(),
  transport: z.union([MCPStdioTransportSchema, MCPSSETransportSchema]),
});

/**
 * MCP config schema (.mcp.json)
 */
export const MCPConfigSchema = z.object({
  mcpServers: z.record(MCPServerSchema),
});

/**
 * Plugin manifest schema (plugin.json)
 */
export const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  skills: z.array(z.string()).optional(),
  agents: z.array(z.string()).optional(),
  hooks: z.array(z.string()).optional(),
  commands: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  dependencies: z.record(z.string()).optional(),
});

/**
 * Marketplace metadata schema (marketplace.json)
 */
export const MarketplaceMetadataSchema = z.object({
  name: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  readme: z.string().optional(),
  changelog: z.string().optional(),
});
