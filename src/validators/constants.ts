/**
 * Shared constants for validators
 */

export const VALID_TOOLS = [
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
];

export const VALID_MODELS = ['sonnet', 'opus', 'haiku', 'inherit'];

export const VALID_PERMISSION_ACTIONS = ['allow', 'ask', 'deny'];

export const VALID_HOOK_EVENTS = [
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
];

export const VALID_HOOK_TYPES = ['command', 'prompt', 'agent'];

export const VALID_CONTEXTS = ['fork', 'inline', 'auto'];

// File size thresholds for CLAUDE.md
export const CLAUDE_MD_SIZE_WARNING_THRESHOLD = 35_000; // 35KB
export const CLAUDE_MD_SIZE_ERROR_THRESHOLD = 40_000; // 40KB
export const CLAUDE_MD_MAX_IMPORT_DEPTH = 5;

// Skill naming constraints
export const SKILL_NAME_MAX_LENGTH = 64;
export const SKILL_NAME_PATTERN = /^[a-z0-9-]+$/;

// Environment variable naming pattern
export const ENV_VAR_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;

// MCP transport types
export const VALID_MCP_TRANSPORT_TYPES = ['stdio', 'sse'];

// Variable expansion patterns
export const VAR_EXPANSION_PATTERN = /\$\{([A-Z_][A-Z0-9_]*)(:-[^}]*)?\}/g;
export const SIMPLE_VAR_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g;

// Semantic versioning pattern
export const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
