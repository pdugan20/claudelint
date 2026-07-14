/**
 * Schema constants - Single source of truth for enum values
 * These Zod schemas are used for validation and also provide runtime values
 */

import { z } from 'zod';

/**
 * Valid Claude Code tool names
 *
 * Kept in conformance with the tool table in `docs-baseline/tools-reference.md` by
 * tests/upstream/tool-names.test.ts, in both directions. Before that gate existed this
 * list had drifted 18 documented tools behind, and every one was a false positive: a user
 * writing `Artifact` or `TodoWrite` in `permissions.allow` was told it was invalid (#122).
 *
 * `Task` and `SlashCommand` are deliberate back-compat entries, not documented tools. Both
 * carry their reason in KNOWN_TOOL_EXTENSIONS (scripts/upstream/tool-names.ts); the gate
 * fails on any other undocumented name.
 */
export const ToolNames = z.enum([
  'Agent',
  'Artifact',
  'AskUserQuestion',
  'Bash',
  'CronCreate',
  'CronDelete',
  'CronList',
  'Edit',
  'EnterPlanMode',
  'EnterWorktree',
  'ExitPlanMode',
  'ExitWorktree',
  'Glob',
  'Grep',
  'ListMcpResourcesTool',
  'LSP',
  'Monitor',
  'NotebookEdit',
  'PowerShell',
  'PushNotification',
  'Read',
  'ReadMcpResourceTool',
  'RemoteTrigger',
  'ReportFindings',
  'ScheduleWakeup',
  'SendMessage',
  'SendUserFile',
  'ShareOnboardingGuide',
  'Skill',
  'TaskCreate',
  'TaskGet',
  'TaskList',
  'TaskOutput',
  'TaskStop',
  'TaskUpdate',
  'TodoWrite',
  'ToolSearch',
  'WaitForMcpServers',
  'WebFetch',
  'WebSearch',
  'Workflow',
  'Write',

  // Back-compat aliases. Not in the documented tool table; see KNOWN_TOOL_EXTENSIONS.
  'Task', // renamed to Agent in v2.1.63; the live CLI still exposes it
  'SlashCommand', // retired upstream, folded into the Skill tool
]);

/**
 * Valid Claude model names
 *
 * docs-baseline/sub-agents.md:290 — "use one of the available aliases: `sonnet`,
 * `opus`, `haiku`, or `fable`". `inherit` is documented alongside them at :273.
 */
export const ModelNames = z.enum(['sonnet', 'opus', 'haiku', 'fable', 'inherit']);

/**
 * Valid permission action types
 */
export const PermissionActions = z.enum(['allow', 'ask', 'deny']);

/**
 * Valid hook event types
 */
export const HookEvents = z.enum([
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'PostToolBatch',
  'PermissionRequest',
  'PermissionDenied',
  'UserPromptSubmit',
  'UserPromptExpansion',
  'Notification',
  'MessageDisplay',
  'Stop',
  'StopFailure',
  'Setup',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'PostCompact',
  'ConfigChange',
  'SessionStart',
  'SessionEnd',
  'WorktreeCreate',
  'WorktreeRemove',
  'TeammateIdle',
  'TaskCreated',
  'TaskCompleted',
  'InstructionsLoaded',
  'Elicitation',
  'ElicitationResult',
  'CwdChanged',
  'FileChanged',
]);

/**
 * Valid hook handler types
 */
export const HookTypes = z.enum(['command', 'http', 'mcp_tool', 'prompt', 'agent']);

/**
 * Valid skill context modes
 * Only 'fork' is documented: https://code.claude.com/docs/en/skills#frontmatter-reference
 */
export const ContextModes = z.enum(['fork']);

/**
 * Valid MCP transport types
 *
 * Note: 'sse' is deprecated, but still supported.
 * Note: 'streamable-http' is a documented alias for 'http' (mcp.md:74).
 *
 * The WebSocket literal is 'ws'. It is NOT 'websocket' -- that value appears nowhere in the
 * docs as a config value, only in prose ("Add a remote WebSocket server"), and modelling it
 * meant claudelint rejected the real thing while three rules keyed themselves to a
 * transport that cannot exist.
 */
export const TransportTypes = z.enum(['stdio', 'sse', 'http', 'streamable-http', 'ws']);

/**
 * Script file extensions
 */
export const ScriptExtensions = z.enum(['.sh', '.py', '.js']);

// Runtime values extracted from schemas
// These can be used in code for array operations, lookups, etc.
export const VALID_TOOLS = ToolNames.options;
export const VALID_MODELS = ModelNames.options;
export const VALID_PERMISSION_ACTIONS = PermissionActions.options;
export const VALID_HOOK_EVENTS = HookEvents.options;
export const VALID_HOOK_TYPES = HookTypes.options;
export const VALID_CONTEXTS = ContextModes.options;
export const VALID_MCP_TRANSPORT_TYPES = TransportTypes.options;
export const SCRIPT_EXTENSIONS = ScriptExtensions.options;

// Type exports for TypeScript usage
export type ToolName = z.infer<typeof ToolNames>;
export type ModelName = z.infer<typeof ModelNames>;
export type PermissionAction = z.infer<typeof PermissionActions>;
export type HookEvent = z.infer<typeof HookEvents>;
export type HookType = z.infer<typeof HookTypes>;
export type ContextMode = z.infer<typeof ContextModes>;
export type TransportType = z.infer<typeof TransportTypes>;
export type ScriptExtension = z.infer<typeof ScriptExtensions>;
