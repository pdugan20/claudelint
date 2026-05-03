/**
 * Shared Zod schemas for validators
 */

import { z } from 'zod';
import { HookTypes } from '../schemas/constants';
import { semver } from '../schemas/refinements';

/**
 * Individual hook handler schema (shared by hooks.json and settings.json)
 * Based on https://code.claude.com/docs/en/hooks
 */
export const SettingsHookSchema = z.object({
  type: HookTypes,
  // Common fields
  if: z.string().optional(),
  timeout: z.number().optional(),
  statusMessage: z.string().optional(),
  once: z.boolean().optional(),
  // command hook fields
  command: z.string().optional(),
  async: z.boolean().optional(),
  asyncRewake: z.boolean().optional(),
  shell: z.enum(['bash', 'powershell']).optional(),
  // http hook fields
  url: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  allowedEnvVars: z.array(z.string()).optional(),
  // mcp_tool hook fields
  server: z.string().optional(),
  tool: z.string().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
  // prompt and agent hook fields
  prompt: z.string().optional(),
  agent: z.string().optional(),
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
  PostToolBatch: z.array(SettingsHookMatcherSchema).optional(),
  PermissionRequest: z.array(SettingsHookMatcherSchema).optional(),
  PermissionDenied: z.array(SettingsHookMatcherSchema).optional(),
  Notification: z.array(SettingsHookMatcherSchema).optional(),
  UserPromptSubmit: z.array(SettingsHookMatcherSchema).optional(),
  UserPromptExpansion: z.array(SettingsHookMatcherSchema).optional(),
  Stop: z.array(SettingsHookMatcherSchema).optional(),
  StopFailure: z.array(SettingsHookMatcherSchema).optional(),
  Setup: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStart: z.array(SettingsHookMatcherSchema).optional(),
  SubagentStop: z.array(SettingsHookMatcherSchema).optional(),
  PreCompact: z.array(SettingsHookMatcherSchema).optional(),
  PostCompact: z.array(SettingsHookMatcherSchema).optional(),
  ConfigChange: z.array(SettingsHookMatcherSchema).optional(),
  SessionStart: z.array(SettingsHookMatcherSchema).optional(),
  SessionEnd: z.array(SettingsHookMatcherSchema).optional(),
  WorktreeCreate: z.array(SettingsHookMatcherSchema).optional(),
  WorktreeRemove: z.array(SettingsHookMatcherSchema).optional(),
  TeammateIdle: z.array(SettingsHookMatcherSchema).optional(),
  TaskCreated: z.array(SettingsHookMatcherSchema).optional(),
  TaskCompleted: z.array(SettingsHookMatcherSchema).optional(),
  InstructionsLoaded: z.array(SettingsHookMatcherSchema).optional(),
  Elicitation: z.array(SettingsHookMatcherSchema).optional(),
  ElicitationResult: z.array(SettingsHookMatcherSchema).optional(),
  CwdChanged: z.array(SettingsHookMatcherSchema).optional(),
  FileChanged: z.array(SettingsHookMatcherSchema).optional(),
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
 * Marketplace source schema for settings (extraKnownMarketplaces)
 * Based on: https://code.claude.com/docs/en/settings
 * Supports: github, git, url, npm, directory, file
 */
export const MarketplaceSourceSchema = z.object({
  source: z.enum(['github', 'git', 'url', 'npm', 'directory', 'file']),
  repo: z.string().optional(), // github
  url: z.string().optional(), // git, url
  package: z.string().optional(), // npm
  path: z.string().optional(), // github (subdir), git (subdir), directory, file
  ref: z.string().optional(), // github, git (branch/tag/SHA)
});

/**
 * Marketplace config schema for settings (extraKnownMarketplaces entries)
 */
export const MarketplaceConfigSchema = z.object({
  source: MarketplaceSourceSchema,
  enabled: z.boolean().optional(),
});

/**
 * Strict marketplace source schema for settings (strictKnownMarketplaces)
 * Based on: https://code.claude.com/docs/en/settings#strictknownmarketplaces
 * Same source types as extraKnownMarketplaces plus hostPattern for regex matching
 */
export const StrictMarketplaceSourceSchema = z.object({
  source: z.enum(['github', 'git', 'url', 'npm', 'directory', 'file', 'hostPattern']),
  repo: z.string().optional(),
  url: z.string().optional(),
  package: z.string().optional(),
  path: z.string().optional(),
  ref: z.string().optional(),
  hostPattern: z.string().optional(), // regex pattern for hostPattern source
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
  strictKnownMarketplaces: z.array(StrictMarketplaceSourceSchema).optional(),
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
 * Plugin user-config option schema
 * https://code.claude.com/docs/en/plugins-reference#user-configuration
 */
export const PluginUserConfigOptionSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'directory', 'file']),
  title: z.string(),
  description: z.string(),
  sensitive: z.boolean().optional(),
  required: z.boolean().optional(),
  default: z.unknown().optional(),
  multiple: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

/**
 * Plugin channel schema
 * https://code.claude.com/docs/en/plugins-reference#channels
 */
export const PluginChannelSchema = z.object({
  server: z.string(),
  userConfig: z.record(z.string(), PluginUserConfigOptionSchema).optional(),
});

/**
 * Plugin dependency entry schema
 * https://code.claude.com/docs/en/plugin-dependencies
 */
export const PluginDependencySchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    version: z.string().optional(),
  }),
]);

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
  $schema: z.string().optional(),
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
  themes: z.union([z.string(), z.array(z.string())]).optional(),
  monitors: z.union([z.string(), z.array(z.string())]).optional(),

  // Config paths
  // Note: The documented spec accepts string|array|object for hooks, but all three are
  // currently broken upstream (anthropics/claude-code#16288, #27307). Only auto-discovery
  // from hooks/hooks.json works. Schema accepts all three per the documented spec.
  hooks: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
  mcpServers: z
    .union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])
    .optional(),
  outputStyles: z.union([z.string(), z.array(z.string())]).optional(),
  lspServers: z
    .union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])
    .optional(),

  // User-facing configuration
  userConfig: z.record(z.string(), PluginUserConfigOptionSchema).optional(),
  channels: z.array(PluginChannelSchema).optional(),

  // Plugin-to-plugin dependencies
  dependencies: z.array(PluginDependencySchema).optional(),
});

/**
 * Marketplace plugin source schema
 * Specifies where to fetch a plugin: relative path or source object
 * Based on: https://code.claude.com/docs/en/plugin-marketplaces#plugin-sources
 */
export const MarketplacePluginSourceSchema = z.union([
  z.string(), // Relative path like "./plugins/my-plugin"
  z.object({
    source: z.enum(['github', 'url', 'git-subdir', 'npm']),
    // github
    repo: z.string().optional(),
    // url (git), git-subdir
    url: z.string().optional(),
    // git-subdir: subdirectory path within the repo
    path: z.string().optional(),
    // npm
    package: z.string().optional(),
    version: z.string().optional(),
    registry: z.string().optional(),
    // git pinning (github, url, git-subdir)
    ref: z.string().optional(),
    sha: z.string().optional(),
  }),
]);

/**
 * Marketplace plugin entry schema
 * Represents a single plugin listed in marketplace.json plugins array
 * Based on: https://code.claude.com/docs/en/plugin-marketplaces#plugin-entries
 */
export const MarketplacePluginEntrySchema = z.object({
  // Required
  name: z.string(),
  source: MarketplacePluginSourceSchema,

  // Optional metadata
  $schema: z.string().optional(),
  description: z.string().optional(),
  version: z.string().optional(),
  author: PluginAuthorSchema.optional(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  strict: z.boolean().optional(),

  // Component overrides (same types as plugin.json)
  commands: z.union([z.string(), z.array(z.string())]).optional(),
  agents: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  themes: z.union([z.string(), z.array(z.string())]).optional(),
  monitors: z.union([z.string(), z.array(z.string())]).optional(),
  hooks: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())]).optional(),
  mcpServers: z
    .union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])
    .optional(),
  outputStyles: z.union([z.string(), z.array(z.string())]).optional(),
  lspServers: z
    .union([z.string(), z.array(z.string()), z.record(z.string(), z.unknown())])
    .optional(),

  // User-facing configuration and dependencies (inherited from plugin manifest)
  userConfig: z.record(z.string(), PluginUserConfigOptionSchema).optional(),
  channels: z.array(PluginChannelSchema).optional(),
  dependencies: z.array(PluginDependencySchema).optional(),
});

/**
 * Marketplace owner schema
 * Based on: https://code.claude.com/docs/en/plugin-marketplaces#owner-fields
 */
export const MarketplaceOwnerSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
});

/**
 * Marketplace metadata schema (marketplace.json)
 * Based on: https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema
 * Verified against:
 * - https://github.com/anthropics/claude-code/blob/main/.claude-plugin/marketplace.json
 * - https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json
 */
export const MarketplaceMetadataSchema = z.object({
  $schema: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  owner: MarketplaceOwnerSchema,
  plugins: z.array(MarketplacePluginEntrySchema),
  metadata: z
    .object({
      description: z.string().optional(),
      version: z.string().optional(),
      pluginRoot: z.string().optional(),
    })
    .optional(),
  // Other marketplaces that plugins in this marketplace may depend on.
  // https://code.claude.com/docs/en/plugin-marketplaces
  allowCrossMarketplaceDependenciesOn: z.array(z.string()).optional(),
});
