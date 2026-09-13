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
  args: z.array(z.string()).optional(),
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
  DirectoryAdded: z.array(SettingsHookMatcherSchema).optional(),
  PostModelSwitch: z.array(SettingsHookMatcherSchema).optional(),
  PreModelSwitch: z.array(SettingsHookMatcherSchema).optional(),
  PreToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUse: z.array(SettingsHookMatcherSchema).optional(),
  PostToolUseFailure: z.array(SettingsHookMatcherSchema).optional(),
  PostToolBatch: z.array(SettingsHookMatcherSchema).optional(),
  PermissionRequest: z.array(SettingsHookMatcherSchema).optional(),
  PermissionDenied: z.array(SettingsHookMatcherSchema).optional(),
  Notification: z.array(SettingsHookMatcherSchema).optional(),
  MessageDisplay: z.array(SettingsHookMatcherSchema).optional(),
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
  // All seven documented modes. claudelint modelled four, so `auto` -- common in current
  // usage -- errored with "Invalid option". `manual` is an alias for `default`.
  defaultMode: z
    .enum(['default', 'manual', 'acceptEdits', 'auto', 'dontAsk', 'plan', 'bypassPermissions'])
    .optional(),
  disableBypassPermissionsMode: z.enum(['disable']).optional(),
  blockReadsOutsideWorkingDirectories: z.boolean().optional(),
  additionalDirectories: z.array(z.string()).optional(),
});

/**
 * Attribution schema for settings
 * Official format uses commit/pr message templates, not enabled/name/email
 */
export const AttributionSchema = z.object({
  sessionUrl: z.boolean().optional(),
  commit: z.string().optional(),
  pr: z.string().optional(),
});

/**
 * Sandbox network schema for settings
 *
 * Every field below is a row in the `sandbox` table at docs-baseline/settings-reference.md (Sandbox sections).
 *
 * claudelint previously modelled exactly two fields here, and BOTH were invented:
 *   - `allowedHosts`  -- the documented field is `allowedDomains`
 *   - `allowedPorts`  -- no such concept; the ports upstream exposes are
 *                        `httpProxyPort` / `socksProxyPort`
 *
 * That is worse than modelling nothing. `SettingsSchema` is non-strict, so unknown keys are
 * stripped silently: a user writing the REAL `allowedDomains` got no validation at all,
 * while a user writing the INVENTED `allowedHosts` got a clean bill of health for a key
 * Claude Code ignores entirely.
 */
export const SandboxNetworkSchema = z.object({
  allowUnixSockets: z.array(z.string()).optional(),
  allowAllUnixSockets: z.boolean().optional(),
  strictAllowlist: z.boolean().optional(),
  allowLocalBinding: z.boolean().optional(),
  allowMachLookup: z.array(z.string()).optional(),
  allowedDomains: z.array(z.string()).optional(),
  deniedDomains: z.array(z.string()).optional(),
  allowManagedDomainsOnly: z.boolean().optional(),
  httpProxyPort: z.number().optional(),
  socksProxyPort: z.number().optional(),
  // Experimental. Documented as an object: "Set `{}` to generate an ephemeral certificate".
  tlsTerminate: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Sandbox filesystem schema for settings (documented, never modelled)
 */
export const SandboxFilesystemSchema = z.object({
  disabled: z.boolean().optional(),
  allowWrite: z.array(z.string()).optional(),
  denyWrite: z.array(z.string()).optional(),
  denyRead: z.array(z.string()).optional(),
  allowRead: z.array(z.string()).optional(),
  allowManagedReadPathsOnly: z.boolean().optional(),
});

/** Credential masking options documented in settings-reference#sandbox-credentials-files. */
const CredentialMaskOptions = {
  extract: z.string().optional(),
  onExtractNoMatch: z.enum(['warn', 'deny', 'error']).optional(),
  decode: z.literal('jwt').optional(),
  maskClaims: z.array(z.string()).min(1).optional(),
  injectHosts: z.array(z.string()).optional(),
};

export const SandboxCredentialsSchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string(),
        mode: z.enum(['deny', 'mask']),
        ...CredentialMaskOptions,
        maskDuplicates: z.boolean().optional(),
      })
    )
    .optional(),
  envVars: z
    .array(
      z.object({
        name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
        mode: z.enum(['deny', 'mask']),
        ...CredentialMaskOptions,
      })
    )
    .optional(),
  awsPairs: z
    .array(
      z.object({
        accessKeyIdVar: z.string(),
        secretAccessKeyVar: z.string(),
        sessionTokenVar: z.string().optional(),
      })
    )
    .optional(),
  sigv4: z
    .object({
      streaming: z.enum(['deny', 'passthrough']).optional(),
      presigned: z.enum(['deny', 'passthrough']).optional(),
      sigv4a: z.enum(['deny', 'passthrough']).optional(),
    })
    .optional(),
  allowPlaintextInject: z.boolean().optional(),
});

/**
 * Sandbox schema for settings
 * Based on the `sandbox` table at docs-baseline/settings-reference.md (Sandbox sections).
 */
export const SandboxSchema = z.object({
  enabled: z.boolean().optional(),
  failIfUnavailable: z.boolean().optional(),
  autoAllowBashIfSandboxed: z.boolean().optional(),
  excludedCommands: z.array(z.string()).optional(),

  // A BOOLEAN, not a list of commands: "Allow commands to run outside the sandbox via the
  // `dangerouslyDisableSandbox` parameter. When set to `false`, the escape hatch is
  // completely disabled... Default: true". Modelled as `string[]`, this rejected the
  // documented usage outright -- `"allowUnsandboxedCommands": false` errored with
  // "expected array, received boolean".
  allowUnsandboxedCommands: z.boolean().optional(),

  filesystem: SandboxFilesystemSchema.optional(),
  credentials: SandboxCredentialsSchema.optional(),
  network: SandboxNetworkSchema.optional(),
  allowAppleEvents: z.boolean().optional(),
  bwrapPath: z.string().optional(),
  socatPath: z.string().optional(),
  enableWeakerNetworkIsolation: z.boolean().optional(),
  ignoreViolations: z.record(z.string(), z.array(z.string())).optional(),
  ripgrep: z.object({ command: z.string(), args: z.array(z.string()).optional() }).optional(),
  enableWeakerNestedSandbox: z.boolean().optional(),
});

/**
 * Marketplace source schema for settings (extraKnownMarketplaces)
 * Based on: https://code.claude.com/docs/en/settings
 * Supports: github, git, url, npm, directory, file, settings
 *
 * `settings` is an INLINE marketplace declared directly in settings.json, with no hosted
 * repository: "`settings`: inline marketplace declared directly in settings.json without a
 * separate hosted repository (uses `name` and `plugins`)" (settings-reference#extraknownmarketplaces).
 * Omitting it meant claudelint rejected the docs' own `extraKnownMarketplaces` example.
 */
export const MarketplaceSourceSchema = z.object({
  source: z.enum(['github', 'git', 'url', 'npm', 'directory', 'file', 'settings']),
  repo: z.string().optional(), // github
  url: z.string().optional(), // git, url
  package: z.string().optional(), // npm
  path: z.string().optional(), // github (subdir), git (subdir), directory, file
  ref: z.string().optional(), // github, git (branch/tag/SHA)
  skipLfs: z.boolean().optional(), // github, git -- skip Git LFS downloads (v2.1.153+)
  name: z.string().optional(), // settings (inline marketplace)
  // z.lazy: MarketplacePluginEntrySchema is declared further down this module. An inline
  // marketplace's plugin entries are the same shape as a hosted marketplace.json's, so
  // reference it rather than duplicating a second, drifting copy of the shape.
  plugins: z.lazy(() => z.array(MarketplacePluginEntrySchema)).optional(),
});

/**
 * Marketplace config schema for settings (extraKnownMarketplaces entries)
 *
 * The entry toggle is `autoUpdate`, not `enabled`: "Each marketplace entry also accepts an
 * optional `autoUpdate` Boolean... When omitted, official Anthropic marketplaces default to
 * `true` and all other marketplaces default to `false`" (settings-reference#extraknownmarketplaces).
 * `enabled` appears nowhere on a marketplace entry -- it was invented.
 *
 * Also documented on the source object for `github` and `git`: `skipLfs`.
 */
export const MarketplaceConfigSchema = z.object({
  source: MarketplaceSourceSchema,
  autoUpdate: z.boolean().optional(),
});

/**
 * Strict marketplace source schema for settings (strictKnownMarketplaces)
 * Based on: https://code.claude.com/docs/en/settings-reference#strictknownmarketplaces
 *
 * Same source types as extraKnownMarketplaces, plus the two regex-matching sources.
 * settings-reference#strictknownmarketplaces — "Most sources use exact matching, while `hostPattern`
 * and `pathPattern` use regex matching against the marketplace host and filesystem path
 * respectively."
 */
export const StrictMarketplaceSourceSchema = z.object({
  source: z.enum([
    'github',
    'git',
    'url',
    'npm',
    'directory',
    'file',
    'hostPattern',
    'pathPattern',
    'skills-dir',
  ]),
  repo: z.string().optional(),
  url: z.string().optional(),
  package: z.string().optional(),
  path: z.string().optional(),
  ref: z.string().optional(),
  hostPattern: z.string().optional(), // regex pattern for hostPattern source
  // settings-reference#strictknownmarketplaces — "Fields: `pathPattern` (required: regex pattern
  // matched against the `path` field of `file` and `directory` sources)"
  pathPattern: z.string().optional(),
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
  // An OBJECT, not a string: `{"type": "command", "command": "~/.claude/statusline.sh"}`.
  // Modelled as `z.string()`, claudelint rejected the documented example outright. The inner
  // shape (`type`, `command`, plus optional `padding`, `refreshInterval`,
  // `hideVimModeIndicator`) is described in prose only, so it stays a loose record rather
  // than being narrowed by guesswork -- tighten it when a page documenting it is watched.
  statusLine: z.record(z.string(), z.unknown()).optional(),
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
  // A STRING, not a boolean: "**Default**: `in-process`. How agent team teammates display:
  // `in-process`, `auto`, ...". Modelled as `z.boolean()`, so the documented `"auto"` was
  // rejected with "expected boolean, received string".
  teammateMode: z.string().optional(),
  showTurnDuration: z.boolean().optional(),
  terminalProgressBarEnabled: z.boolean().optional(),
  spinnerTipsEnabled: z.boolean().optional(),
  alwaysThinkingEnabled: z.boolean().optional(),
  prefersReducedMotion: z.boolean().optional(),
  plansDirectory: z.string().optional(),
  skipWebFetchPreflight: z.boolean().optional(),

  // Settings documented by the reference index. Existing loose objects stay permissive
  // where only example-level evidence is available; explicit sub-key tables and field
  // sections supply the more detailed shapes below. ~/.claude.json-only keys and the
  // policy-helper stdout envelope are excluded by the conformance tests.
  // Documented as containing `environment`, `allow`, `soft_deny` and `hard_deny`, plus the
  // separately-documented `classifyAllShell` row. `.passthrough()` is not used: the object
  // is non-strict already, and enumerating only the keys the docs name keeps this honest
  // about what is actually evidenced.
  autoMode: z
    .object({
      environment: z.array(z.string()).optional(),
      allow: z.array(z.string()).optional(),
      soft_deny: z.array(z.string()).optional(),
      hard_deny: z.array(z.string()).optional(),
      classifyAllShell: z.boolean().optional(),
    })
    .optional(),
  advisorModel: z.string().optional(),
  agent: z.string().optional(),
  agentPushNotifEnabled: z.boolean().optional(),
  allowAllClaudeAiMcps: z.boolean().optional(),
  allowManagedHooksOnly: z.boolean().optional(),
  allowManagedMcpServersOnly: z.boolean().optional(),
  allowManagedPermissionRulesOnly: z.boolean().optional(),
  allowedChannelPlugins: z.array(z.record(z.string(), z.unknown())).optional(),
  allowedHttpHookUrls: z.array(z.string()).optional(),
  allowedMcpServers: z.array(z.record(z.string(), z.unknown())).optional(),
  askUserQuestionTimeout: z.string().optional(),
  autoCompactEnabled: z.boolean().optional(),
  autoMemoryDirectory: z.string().optional(),
  autoMemoryEnabled: z.boolean().optional(),
  autoScrollEnabled: z.boolean().optional(),
  availableModels: z.array(z.string()).optional(),
  awaySummaryEnabled: z.boolean().optional(),
  awsAuthRefresh: z.string().optional(),
  awsCredentialExport: z.string().optional(),
  axScreenReader: z.boolean().optional(),
  blockedMarketplaces: z.array(z.record(z.string(), z.unknown())).optional(),
  browserExternalPageTools: z.string().optional(),
  channelsEnabled: z.boolean().optional(),
  claudeMd: z.string().optional(),
  claudeMdExcludes: z.array(z.string()).optional(),
  companyAnnouncements: z.array(z.string()).optional(),
  defaultShell: z.string().optional(),
  deniedMcpServers: z.array(z.record(z.string(), z.unknown())).optional(),
  disableAgentView: z.boolean().optional(),
  disableArtifact: z.boolean().optional(),
  disableAutoMode: z.string().optional(),
  disableBundledSkills: z.boolean().optional(),
  disableClaudeAiConnectors: z.boolean().optional(),
  disableDeepLinkRegistration: z.string().optional(),
  disableRemoteControl: z.boolean().optional(),
  disableSideloadFlags: z.boolean().optional(),
  disableSkillShellExecution: z.boolean().optional(),
  disableWorkflows: z.boolean().optional(),
  disabledMcpjsonServers: z.array(z.string()).optional(),
  editorMode: z.string().optional(),
  effortLevel: z.string().optional(),
  enableArtifact: z.boolean().optional(),
  enabledMcpjsonServers: z.array(z.string()).optional(),
  enforceAvailableModels: z.boolean().optional(),
  fallbackModel: z.array(z.string()).optional(),
  fastModePerSessionOptIn: z.boolean().optional(),
  feedbackSurveyRate: z.number().optional(),
  fileCheckpointingEnabled: z.boolean().optional(),
  fileSuggestion: z.record(z.string(), z.unknown()).optional(),
  footerLinksRegexes: z.array(z.record(z.string(), z.unknown())).optional(),
  forceLoginGatewayUrl: z.string().optional(),
  forceLoginMethod: z.string().optional(),
  forceLoginOrgUUID: z.union([z.string(), z.array(z.string())]).optional(),
  forceRemoteSettingsRefresh: z.boolean().optional(),
  gcpAuthRefresh: z.string().optional(),
  httpHookAllowedEnvVars: z.array(z.string()).optional(),
  includeGitInstructions: z.boolean().optional(),
  inputNeededNotifEnabled: z.boolean().optional(),
  minimumVersion: z.string().optional(),
  modelOverrides: z.record(z.string(), z.unknown()).optional(),
  otelHeadersHelper: z.string().optional(),
  parentSettingsBehavior: z.string().optional(),
  pluginSuggestionMarketplaces: z.array(z.string()).optional(),
  pluginTrustMessage: z.string().optional(),
  policyHelper: z
    .object({
      path: z.string(),
      refreshIntervalMs: z.union([z.literal(0), z.number().int().min(60000)]).optional(),
      timeoutMs: z.number().int().min(1000).optional(),
    })
    .optional(),
  prUrlTemplate: z.string().optional(),
  preferredNotifChannel: z.string().optional(),
  remoteControlAtStartup: z.boolean().optional(),
  requiredMaximumVersion: z.string().optional(),
  requiredMinimumVersion: z.string().optional(),
  respondToBashCommands: z.boolean().optional(),
  showClearContextOnPlanAccept: z.boolean().optional(),
  showThinkingSummaries: z.boolean().optional(),
  skillListingBudgetFraction: z.number().optional(),
  skillListingMaxDescChars: z.number().optional(),
  skillOverrides: z.record(z.string(), z.unknown()).optional(),
  spinnerTipsOverride: z.record(z.string(), z.unknown()).optional(),
  spinnerVerbs: z.record(z.string(), z.unknown()).optional(),
  sshConfigs: z.array(z.record(z.string(), z.unknown())).optional(),
  strictPluginOnlyCustomization: z.union([z.literal(true), z.array(z.string())]).optional(),
  syntaxHighlightingDisabled: z.boolean().optional(),
  theme: z.string().optional(),
  tui: z.string().optional(),
  ultracode: z.boolean().optional(),
  useAutoModeDuringPlan: z.boolean().optional(),
  verbose: z.boolean().optional(),
  viewMode: z.string().optional(),
  voice: z.record(z.string(), z.unknown()).optional(),
  voiceEnabled: z.boolean().optional(),
  wheelScrollAccelerationEnabled: z.boolean().optional(),
  workflowKeywordTriggerEnabled: z.boolean().optional(),
  wslInheritsWindowsSettings: z.boolean().optional(),

  // settings-reference.md: field types and examples under each indexed setting.
  autoCompactWindow: z.number().min(100000).max(1000000).optional(),
  autoContinueAtUsageLimit: z.boolean().optional(),
  bashOutputMaxChars: z.number().int().positive().optional(),
  crossSessionInbound: z.enum(['accept', 'hold', 'refuse']).optional(),
  desktopSessionCleanupPeriodDays: z.number().int().nonnegative().optional(),
  dialogExpiry: z.enum(['60s', '5m', '10m', 'never']).optional(),
  disableBrowserExternalNavigation: z.boolean().optional(),
  disableCommandPluginSources: z.boolean().optional(),
  disableDesktopLocalSessions: z.boolean().optional(),
  disableMobileSimulatorTools: z.boolean().optional(),
  emojiCompletionEnabled: z.boolean().optional(),
  enableWorkflows: z.boolean().optional(),
  fastMode: z.boolean().optional(),
  feedbackDrafts: z.enum(['notify', 'quiet', 'off']).optional(),
  includeCoAuthoredBy: z.boolean().optional(),
  isolatePeerMachines: z.boolean().optional(),
  keybindingFlavor: z.enum(['classic', 'readline']).optional(),
  managedMcpServers: z
    .lazy(() => z.record(z.string(), z.union([MCPHTTPTransportSchema, MCPSSETransportSchema])))
    .optional(),
  managedSourcesBehavior: z.enum(['first-wins', 'merge']).optional(),
  maxEffortLevel: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
  modelPicker: z
    .object({
      options: z.array(
        z.object({
          model: z.string(),
          label: z.string().optional(),
          description: z.string().optional(),
        })
      ),
      replaceBuiltInOptions: z.boolean().optional(),
    })
    .optional(),
  modelPricing: z
    .object({
      multiplier: z.number().positive().max(1).optional(),
      overrides: z
        .record(
          z.string(),
          z.object({
            input: z.number().min(0).max(10000),
            output: z.number().min(0).max(10000),
            cacheRead: z.number().min(0).max(10000),
            cacheWrite: z.number().min(0).max(10000),
          })
        )
        .optional(),
    })
    .optional(),
  modelSettings: z
    .record(
      z.string(),
      z.object({
        effortLevel: z.enum(['low', 'medium', 'high', 'xhigh']).optional(),
        maxEffortLevel: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).optional(),
      })
    )
    .optional(),
  pluginConfigs: z
    .record(
      z.string(),
      z.object({
        options: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]))
          .optional(),
        mcpServers: z
          .record(
            z.string(),
            z.record(
              z.string(),
              z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
            )
          )
          .optional(),
      })
    )
    .optional(),
  processWrapper: z.string().optional(),
  promptCacheTtl: z.enum(['5m', '1h']).optional(),
  promptSuggestionEnabled: z.boolean().optional(),
  remote: z.object({ defaultEnvironmentId: z.string().optional() }).optional(),
  skipAutoPermissionPrompt: z.boolean().optional(),
  skipDangerousModePermissionPrompt: z.boolean().optional(),
  spellcheck: z
    .object({
      enabled: z.boolean().optional(),
      checker: z.enum(['aspell', 'hunspell', 'ispell', 'auto']).optional(),
      language: z.string().optional(),
      color: z.string().optional(),
    })
    .optional(),
  sshHostAllowlist: z.array(z.string()).optional(),
  subagentPromptCacheTtl: z.enum(['5m', '1h']).optional(),
  subagentStatusLine: z.object({ type: z.literal('command'), command: z.string() }).optional(),
  switchModelsOnFlag: z.boolean().optional(),
  syncClaudeAiSkills: z.boolean().optional(),
  taskOutputMaxChars: z.number().int().positive().optional(),
  terminalTitleFromRename: z.boolean().optional(),
  timeFormat: z.string().optional(),
  timeZone: z.string().optional(),
  vimInsertModeRemaps: z.record(z.string().length(2), z.literal('<Esc>')).optional(),
  workflowSizeGuideline: z.enum(['unrestricted', 'small', 'medium', 'large']).optional(),
  worktree: z
    .object({
      baseRef: z.enum(['head', 'fresh']).optional(),
      symlinkDirectories: z.array(z.string()).optional(),
      sparsePaths: z.array(z.string()).optional(),
      bgIsolation: z.enum(['worktree', 'none']).optional(),
    })
    .optional(),
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
const MCPCommonOptions = {
  timeout: z.number().optional(),
  alwaysLoad: z.boolean().optional(),
};

const MCPRemoteOptions = {
  ...MCPCommonOptions,
  headersHelper: z.string().optional(),
  oauth: z
    .object({
      clientId: z.string().optional(),
      callbackPort: z.number().optional(),
      authServerMetadataUrl: z.string().optional(),
      scopes: z.string().optional(),
    })
    .optional(),
};

export const MCPStdioTransportSchema = z.object({
  ...MCPCommonOptions,
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
  ...MCPRemoteOptions,
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
  ...MCPRemoteOptions,
  type: z.literal('http'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP streamable-http transport schema
 *
 * A documented ALIAS for `http`, not a distinct transport: "the `type` field accepts
 * `streamable-http` as an alias for `http`. The MCP specification uses the name
 * `streamable-http` for this transport, so configurations copied from server documentation
 * work without modification." (docs-baseline/mcp.md:74)
 */
export const MCPStreamableHTTPTransportSchema = MCPHTTPTransportSchema.extend({
  type: z.literal('streamable-http'),
});

/**
 * MCP WebSocket transport schema
 *
 * The config literal is `ws`, NOT `websocket`. claudelint modelled `websocket` for three
 * releases -- a value that appears nowhere in the docs as a config value; the word occurs
 * only in prose ("Add a remote WebSocket server"). The real one was rejected outright.
 * See docs-baseline/mcp.md:141.
 *
 * `headers` belongs here for the same reason: "The `type: "ws"` entry accepts the same
 * `url`, `headers`, `headersHelper`, `timeout`, and `alwaysLoad` fields as `http`."
 */
export const MCPWebSocketTransportSchema = z.object({
  ...MCPRemoteOptions,
  type: z.literal('ws'),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
});

/**
 * MCP server configuration (discriminated union based on transport type)
 * Server name is the key in mcpServers object, not a field
 */
export const MCPServerSchema = z
  .discriminatedUnion('type', [
    MCPHTTPTransportSchema,
    MCPStreamableHTTPTransportSchema,
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
    // Resolve `name` in a different marketplace. Requires the root marketplace to list
    // that marketplace in allowCrossMarketplaceDependenciesOn.
    // https://code.claude.com/docs/en/plugin-dependencies
    marketplace: z.string().optional(),
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
  displayName: z.string().optional(),
  defaultEnabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  workflows: z.union([z.string(), z.array(z.string())]).optional(),
  experimental: z
    .object({
      themes: z.union([z.string(), z.array(z.string())]).optional(),
      monitors: z.union([z.string(), z.array(z.string())]).optional(),
      evals: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .optional(),
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
  //
  // All three documented forms (string | array | object) work as of Claude Code 2.1.208,
  // verified by firing a real SessionStart hook from each. An earlier comment here claimed
  // they were "all broken upstream" and that only auto-discovery from hooks/hooks.json
  // worked; that is false, and it was the premise for disabling
  // `plugin-hook-missing-plugin-root` (#40).
  //
  // docs-baseline/plugins-reference.md:83 -- "Location: `hooks/hooks.json` in plugin root,
  // or inline in plugin.json"
  //
  // What DOES fail is a hook command using a relative path: the plugin loads, the hook
  // silently never fires, and `claude plugin validate --strict` passes it.
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
  z.object({
    source: z.literal('archive'),
    url: z.string().url().startsWith('https://'),
    sha256: z
      .string()
      .regex(/^[A-Fa-f0-9]{64}$/)
      .optional(),
  }),
  z.object({
    source: z.literal('command'),
    command: z
      .string()
      .min(1)
      .max(500)
      .regex(/^(?!.* {4})[\x20-\x7E]+$/),
    timeout: z.number().int().positive().max(600).optional(),
    mode: z.enum(['copy', 'link']).optional(),
  }),
]);

/**
 * Marketplace plugin entry schema
 * Represents a single plugin listed in marketplace.json plugins array
 * Based on: https://code.claude.com/docs/en/plugin-marketplaces#plugin-entries
 */
export const MarketplacePluginEntrySchema = z.object({
  relevance: z.record(z.string(), z.unknown()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  headersHelper: z.string().optional(),
  displayName: z.string().optional(),
  defaultEnabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  workflows: z.union([z.string(), z.array(z.string())]).optional(),
  experimental: z
    .object({
      themes: z.union([z.string(), z.array(z.string())]).optional(),
      monitors: z.union([z.string(), z.array(z.string())]).optional(),
      evals: z.union([z.string(), z.array(z.string())]).optional(),
    })
    .optional(),
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
  renames: z.record(z.string(), z.string().nullable()).optional(),
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
