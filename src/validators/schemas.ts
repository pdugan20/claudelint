/**
 * Shared Zod schemas for validators
 */

import { z } from 'zod';
import { HookTypes } from '../schemas/constants';
import { semver } from '../schemas/refinements';

/**
 * Individual hook handler schema (shared by hooks.json and settings.json)
 * Based on official schema: https://json.schemastore.org/claude-code-settings.json
 */
export const SettingsHookSchema = z.object({
  type: HookTypes,
  command: z.string().optional(),
  prompt: z.string().optional(),
  agent: z.string().optional(),
  timeout: z.number().optional(),
  statusMessage: z.string().optional(),
  once: z.boolean().optional(),
  model: z.string().optional(),
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
  TeammateIdle: z.array(SettingsHookMatcherSchema).optional(),
  TaskCompleted: z.array(SettingsHookMatcherSchema).optional(),
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
 * Official format uses commit/pr message templates, not enabled/name/email
 */
export const AttributionSchema = z.object({
  commit: z.string().optional(),
  pr: z.string().optional(),
});

/**
 * Sandbox network schema for settings
 */
export const SandboxNetworkSchema = z.object({
  allowedHosts: z.array(z.string()).optional(),
  allowedPorts: z.array(z.number()).optional(),
});

/**
 * Sandbox schema for settings
 * Based on official Claude Code sandbox configuration
 */
export const SandboxSchema = z.object({
  enabled: z.boolean().optional(),
  autoAllowBashIfSandboxed: z.boolean().optional(),
  excludedCommands: z.array(z.string()).optional(),
  allowUnsandboxedCommands: z.array(z.string()).optional(),
  network: SandboxNetworkSchema.optional(),
  enableWeakerNestedSandbox: z.boolean().optional(),
  ignoreViolations: z.boolean().optional(),
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
  $schema: z.string().optional(),
  permissions: PermissionsSchema.optional(),
  env: z.record(z.string(), z.string()).optional(),
  // Note: model accepts arbitrary strings (aliases, full model names, ARNs, etc.)
  // Don't use ModelNames enum - that's only for agent/skill frontmatter
  model: z.string().optional(),
  apiKeyHelper: z.string().optional(),
  hooks: SettingsHooksSchema.optional(),
  attribution: AttributionSchema.optional(),
  statusLine: z.string().optional(),
  outputStyle: z.string().optional(),
  sandbox: SandboxSchema.optional(),
  enabledPlugins: z.record(z.string(), z.boolean()).optional(),
  extraKnownMarketplaces: z.record(z.string(), MarketplaceConfigSchema).optional(),
  strictKnownMarketplaces: z.boolean().optional(),
  autoUpdatesChannel: z.string().optional(),
  cleanupPeriodDays: z.number().optional(),
  language: z.string().optional(),
  respectGitignore: z.boolean().optional(),
  enableAllProjectMcpServers: z.boolean().optional(),
  disableAllHooks: z.boolean().optional(),
  teammateMode: z.boolean().optional(),
  showTurnDuration: z.boolean().optional(),
  terminalProgressBarEnabled: z.boolean().optional(),
  spinnerTipsEnabled: z.boolean().optional(),
  alwaysThinkingEnabled: z.boolean().optional(),
  prefersReducedMotion: z.boolean().optional(),
  plansDirectory: z.string().optional(),
  skipWebFetchPreflight: z.boolean().optional(),
});

/**
 * Hooks config schema (hooks.json)
 * Uses object-keyed-by-event format matching settings.json hooks
 */
export const HooksConfigSchema = z.object({
  description: z.string().optional(),
  hooks: SettingsHooksSchema,
});

/**
 * MCP stdio transport schema
 * For local servers running as subprocesses
 */
export const MCPStdioTransportSchema = z.object({
  type: z.literal('stdio').optional(), // Optional since stdio is default when command is present
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP SSE transport schema (deprecated)
 * For remote servers using Server-Sent Events
 */
export const MCPSSETransportSchema = z.object({
  type: z.literal('sse'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP HTTP transport schema
 * For remote servers using HTTP
 */
export const MCPHTTPTransportSchema = z.object({
  type: z.literal('http'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP WebSocket transport schema
 * For remote servers using WebSocket
 */
export const MCPWebSocketTransportSchema = z.object({
  type: z.literal('websocket'),
  url: z.string(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP server configuration (discriminated union based on transport type)
 * Server name is the key in mcpServers object, not a field
 */
export const MCPServerSchema = z
  .discriminatedUnion('type', [
    MCPHTTPTransportSchema,
    MCPSSETransportSchema,
    MCPWebSocketTransportSchema,
  ])
  .or(MCPStdioTransportSchema); // Stdio is special since type is optional

/**
 * MCP servers record (shared between wrapped and flat formats)
 */
export const MCPServersRecord = z.record(z.string(), MCPServerSchema);

/**
 * MCP config schema (.mcp.json)
 * Based on https://code.claude.com/docs/en/mcp
 *
 * Supports two formats:
 * - Wrapped: { "mcpServers": { "name": { ... } } } (project scope)
 * - Flat: { "name": { ... } } (plugin scope, no mcpServers wrapper)
 *
 * Flat format is normalized to wrapped format during validation.
 */
export const MCPConfigSchema = z.preprocess(
  (data) => {
    if (data && typeof data === 'object' && !Array.isArray(data) && 'mcpServers' in data) {
      return data; // Already wrapped format
    }
    // Flat format: treat entire object as server map
    return { mcpServers: data };
  },
  z.object({
    mcpServers: MCPServersRecord,
  })
);

/**
 * Plugin author schema
 */
export const PluginAuthorSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  url: z.string().optional(),
});

/**
 * Plugin manifest schema (plugin.json)
 * Based on official spec: https://code.claude.com/docs/en/plugins-reference#complete-schema
 *
 * Note: author must be an object with name (required), email/url (optional).
 * String format is NOT supported by Claude Code.
 */
export const PluginManifestSchema = z.object({
  // Required fields
  name: z.string(),

  // Optional metadata
  version: semver().optional(),
  description: z.string().optional(),
  author: PluginAuthorSchema.optional(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),

  // Component paths (string or array)
  commands: z.union([z.string(), z.array(z.string())]).optional(),
  agents: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),

  // Config paths (string for path, object for inline config)
  hooks: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  mcpServers: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  outputStyles: z.union([z.string(), z.array(z.string())]).optional(),
  lspServers: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
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
