/**
 * Shared Zod schemas for validators
 */

import { z } from 'zod';
import { ModelNames, HookTypes } from '../schemas/constants';
import { semver } from '../schemas/refinements';

/**
 * Matcher schema for hooks
 */
export const MatcherSchema = z.object({
  tool: z.string().optional(),
  pattern: z.string().optional(),
});

/**
 * Hook schema for hooks.json files (array format with event field)
 * Note: event uses z.string() instead of HookEvents enum to provide
 * custom validation with warnings for unknown events
 * Note: command/prompt/agent mutual exclusivity is validated in validation-helpers.ts
 */
export const HookSchema = z.object({
  event: z.string(),
  matcher: MatcherSchema.optional(),
  type: HookTypes,
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
 * Individual hook schema for settings.json (command or prompt type)
 * Based on official schema: https://json.schemastore.org/claude-code-settings.json
 */
export const SettingsHookSchema = z.object({
  type: z.enum(['command', 'prompt']),
  command: z.string().optional(),
  prompt: z.string().optional(),
  timeout: z.number().optional(),
});

/**
 * Hook matcher schema for settings.json
 * Contains optional matcher pattern and array of hooks
 */
export const SettingsHookMatcherSchema = z.object({
  matcher: z.string().optional(),
  hooks: z.array(SettingsHookSchema),
});

/**
 * Hooks schema for settings.json (object format with event names as keys)
 * Based on official schema: https://json.schemastore.org/claude-code-settings.json
 */
export const SettingsHooksSchema = z.object({
  PreToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUseFailure: z.array(SettingsHookMatcherSchema).optional(),
  PermissionRequest: z.array(SettingsHookMatcherSchema).optional(),
  Notification: z.array(SettingsHookMatcherSchema).optional(),
  UserPromptSubmit: z.array(SettingsHookMatcherSchema).optional(),
  Stop: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStart: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStop: z.array(SettingsHookMatcherSchema).optional(),
  PreCompact: z.array(SettingsHookMatcherSchema).optional(),
  Setup: z.array(SettingsHookMatcherSchema).optional(),
  SessionStart: z.array(SettingsHookMatcherSchema).optional(),
  SessionEnd: z.array(SettingsHookMatcherSchema).optional(),
});

/**
 * Permissions schema for settings
 * Based on official Claude Code schema: https://json.schemastore.org/claude-code-settings.json
 *
 * Permission rules use Tool(pattern) syntax:
 * - "Bash" - matches all bash commands
 * - "Bash(npm run *)" - matches npm run with wildcard
 * - "Read(./.env)" - matches specific file
 * - "WebFetch(domain:example.com)" - matches specific domain
 */
export const PermissionsSchema = z.object({
  allow: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  ask: z.array(z.string()).optional(),
  defaultMode: z.enum(['acceptEdits', 'bypassPermissions', 'default', 'plan']).optional(),
  disableBypassPermissionsMode: z.enum(['disable']).optional(),
  additionalDirectories: z.array(z.string()).optional(),
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
 * Based on official schema: https://json.schemastore.org/claude-code-settings.json
 * Verify sync with: npm run check:schema-sync
 */
export const SettingsSchema = z.object({
  permissions: PermissionsSchema.optional(),
  env: z.record(z.string()).optional(),
  model: ModelNames.optional(),
  apiKeyHelper: z.string().optional(),
  hooks: SettingsHooksSchema.optional(),
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
 * MCP HTTP transport schema
 */
export const MCPHTTPTransportSchema = z.object({
  type: z.literal('http'),
  url: z.string(),
  headers: z.record(z.string()).optional(),
  env: z.record(z.string()).optional(),
});

/**
 * MCP WebSocket transport schema
 */
export const MCPWebSocketTransportSchema = z.object({
  type: z.literal('websocket'),
  url: z.string(),
  env: z.record(z.string()).optional(),
});

/**
 * MCP server schema
 */
export const MCPServerSchema = z.object({
  name: z.string(),
  transport: z.union([
    MCPStdioTransportSchema,
    MCPSSETransportSchema,
    MCPHTTPTransportSchema,
    MCPWebSocketTransportSchema,
  ]),
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
  version: semver(),
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
  version: semver(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  readme: z.string().optional(),
  changelog: z.string().optional(),
});
