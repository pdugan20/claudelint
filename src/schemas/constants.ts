/**
 * Schema constants - Single source of truth for enum values
 * These Zod schemas are used for validation and also provide runtime values
 */

import { z } from 'zod';

/**
 * Valid Claude Code tool names
 */
export const ToolNames = z.enum([
  'Bash',
  'Read',
  'Write',
  'Edit',
  'Glob',
  'Grep',
  'Task',
  'WebFetch',
  'WebSearch',
  'LSP',
  'AskUserQuestion',
  'EnterPlanMode',
  'ExitPlanMode',
  'Skill',
  'TaskCreate',
  'TaskUpdate',
  'TaskGet',
  'TaskList',
  'TaskOutput',
  'TaskStop',
  'NotebookEdit',
]);

/**
 * Valid Claude model names
 */
export const ModelNames = z.enum(['sonnet', 'opus', 'haiku', 'inherit']);

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
  'PermissionRequest',
  'UserPromptSubmit',
  'Notification',
  'Stop',
  'SubagentStart',
  'SubagentStop',
  'PreCompact',
  'Setup',
  'SessionStart',
  'SessionEnd',
  'TeammateIdle',
  'TaskCompleted',
]);

/**
 * Valid hook handler types
 */
export const HookTypes = z.enum(['command', 'prompt', 'agent']);

/**
 * Valid skill context modes
 */
export const ContextModes = z.enum(['fork', 'inline', 'auto']);

/**
 * Valid MCP transport types
 * Note: 'sse' is deprecated, but still supported
 */
export const TransportTypes = z.enum(['stdio', 'sse', 'http', 'websocket']);

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
