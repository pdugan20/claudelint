/**
 * Centralized file pattern constants for Claude Code file discovery.
 *
 * Single source of truth for all glob patterns used across the codebase:
 * validators, format command, watch command, init wizard, and files.ts.
 *
 * Aligned with official Claude Code documentation:
 *   - Memory:   https://code.claude.com/docs/en/memory
 *   - Skills:   https://code.claude.com/docs/en/skills
 *   - Hooks:    https://code.claude.com/docs/en/hooks
 *   - Agents:   https://code.claude.com/docs/en/sub-agents
 *   - Plugins:  https://code.claude.com/docs/en/plugins-reference
 *   - Settings: https://code.claude.com/docs/en/settings
 *   - MCP:      https://code.claude.com/docs/en/mcp
 */

// ---------------------------------------------------------------------------
// Core discovery patterns (used by files.ts find* functions)
// ---------------------------------------------------------------------------

/** CLAUDE.md and rule files */
export const CLAUDE_MD_PATTERNS = [
  '**/CLAUDE.md',
  '**/.claude/CLAUDE.md',
  '**/CLAUDE.local.md',
  '.claude/rules/**/*.md',
] as const;

/** Skill directories (matched via SKILL.md presence) */
export const SKILL_PATTERNS = ['**/.claude/skills/*/SKILL.md', 'skills/*/SKILL.md'] as const;

/** Agent files (flat .md files named after the agent) */
export const AGENT_PATTERNS = ['.claude/agents/*.md', 'agents/*.md'] as const;

/** Output style markdown files */
export const OUTPUT_STYLE_PATTERNS = [
  '.claude/output-styles/*/*.md',
  'output-styles/*/*.md',
] as const;

/** Settings configuration files */
export const SETTINGS_PATTERNS = ['.claude/settings.json', '.claude/settings.local.json'] as const;

/** Hooks configuration files (plugin root only — project hooks live in settings.json) */
export const HOOKS_PATTERNS = ['hooks/hooks.json'] as const;

/** MCP configuration files */
export const MCP_PATTERNS = ['.mcp.json'] as const;

/** LSP configuration files */
export const LSP_PATTERNS = ['.claude/lsp.json', '.lsp.json'] as const;

/** Plugin manifest files */
export const PLUGIN_PATTERNS = ['plugin.json', '.claude-plugin/plugin.json'] as const;

/** Slash-command files */
export const COMMANDS_PATTERNS = ['.claude/commands/**/*', 'commands/**/*'] as const;

// ---------------------------------------------------------------------------
// Format command patterns (files the format pipeline should process)
// ---------------------------------------------------------------------------

/** Markdown files eligible for formatting */
export const FORMATTABLE_MARKDOWN = [
  '**/CLAUDE.md',
  '**/.claude/CLAUDE.md',
  '**/CLAUDE.local.md',
  '.claude/rules/**/*.md',
  '**/.claude/skills/*/SKILL.md',
  'skills/*/SKILL.md',
  '.claude/agents/*.md',
  'agents/*.md',
  '.claude/output-styles/*/*.md',
  'output-styles/*/*.md',
  '.claude/commands/**/*.md',
] as const;

/** JSON files eligible for formatting */
export const FORMATTABLE_JSON = [
  '.claude/settings.json',
  '.claude/settings.local.json',
  'hooks/hooks.json',
  '.claude/lsp.json',
  '.mcp.json',
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
] as const;

/** YAML files eligible for formatting */
export const FORMATTABLE_YAML = ['.claude/**/*.{yaml,yml}'] as const;

/** Shell scripts eligible for formatting/linting */
export const FORMATTABLE_SHELL = [
  '.claude/**/*.sh',
  'skills/**/*.sh',
  '.claude/skills/**/*.sh',
] as const;

// ---------------------------------------------------------------------------
// Watch command triggers (maps validator IDs to file suffix triggers)
// ---------------------------------------------------------------------------

/** Maps validator IDs to filename suffixes that trigger re-validation */
export const WATCH_TRIGGERS: Record<string, string[]> = {
  'claude-md': ['CLAUDE.md', 'CLAUDE.local.md'],
  skills: ['SKILL.md', '.sh'],
  settings: ['settings.json', 'settings.local.json'],
  hooks: ['hooks.json'],
  mcp: ['.mcp.json'],
  plugin: ['plugin.json', 'marketplace.json'],
  agents: ['.md'],
  'output-styles': ['.md'],
  lsp: ['lsp.json'],
  commands: ['.md'],
};

// ---------------------------------------------------------------------------
// Validator file patterns (used by ValidatorRegistry.register filePatterns)
// ---------------------------------------------------------------------------

/** Maps validator IDs to glob patterns for stdin filename matching */
export const VALIDATOR_FILE_PATTERNS: Record<string, string[]> = {
  'claude-md': [
    '**/CLAUDE.md',
    '**/.claude/CLAUDE.md',
    '**/CLAUDE.local.md',
    '**/.claude/rules/*.md',
    '**/.claude/rules/**/*.md',
  ],
  skills: ['**/.claude/skills/*/SKILL.md', 'skills/*/SKILL.md'],
  hooks: ['hooks/hooks.json'],
  mcp: ['**/.mcp.json'],
  settings: ['**/.claude/settings.json', '**/.claude/settings.local.json'],
  agents: ['**/.claude/agents/*.md', 'agents/*.md'],
  'output-styles': ['**/.claude/output-styles/*/*.md', 'output-styles/*/*.md'],
  plugin: ['**/plugin.json', '**/.claude-plugin/marketplace.json'],
  lsp: ['**/.claude/lsp.json'],
  commands: ['**/.claude/commands/**/*', 'commands/**/*'],
};

// ---------------------------------------------------------------------------
// Init wizard detection paths (relative paths for existsSync checks)
// ---------------------------------------------------------------------------

/** Paths checked by the init wizard to detect existing project structure */
export const INIT_DETECTION_PATHS = {
  claudeDir: '.claude',
  skills: '.claude/skills',
  settings: '.claude/settings.json',
  hooks: 'hooks/hooks.json',
  agents: '.claude/agents',
  outputStyles: '.claude/output-styles',
  commands: '.claude/commands',
  mcp: '.mcp.json',
  plugin: 'plugin.json',
  claudeMd: 'CLAUDE.md',
  packageJson: 'package.json',
} as const;
