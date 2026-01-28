/**
 * Type-safe rule IDs
 * All validation rule IDs are defined here as a union type
 */

/**
 * CLAUDE.md validator rule IDs
 */
export type ClaudeMdRuleId =
  | 'size-error'
  | 'size-warning'
  | 'import-missing'
  | 'import-circular'
  | 'import-in-code-block'
  | 'frontmatter-invalid-paths'
  | 'rules-circular-symlink'
  | 'filename-case-sensitive'
  | 'content-too-many-sections'
  | 'glob-pattern-backslash'
  | 'glob-pattern-too-broad'
  | 'file-not-found';

/**
 * Skills validator rule IDs
 */
export type SkillsRuleId =
  | 'skill-missing-shebang'
  | 'skill-missing-comments'
  | 'skill-dangerous-command'
  | 'skill-eval-usage'
  | 'skill-path-traversal'
  | 'skill-missing-changelog'
  | 'skill-missing-examples'
  | 'skill-missing-version'
  | 'skill-too-many-files'
  | 'skill-deep-nesting'
  | 'skill-naming-inconsistent'
  | 'skill-time-sensitive-content'
  | 'skill-body-too-long'
  | 'skill-large-reference-no-toc';

/**
 * Agents validator rule IDs
 */
export type AgentsRuleId = 'agent-hooks-invalid-schema' | 'agent-skills-not-found';

/**
 * Settings validator rule IDs
 */
export type SettingsRuleId =
  | 'settings-invalid-schema'
  | 'settings-invalid-permission'
  | 'settings-invalid-env-var'
  | 'settings-permission-invalid-rule'
  | 'settings-permission-empty-pattern';

/**
 * Hooks validator rule IDs
 */
export type HooksRuleId =
  | 'hooks-invalid-event'
  | 'hooks-missing-script'
  | 'hooks-invalid-config';

/**
 * MCP validator rule IDs
 */
export type McpRuleId = 'mcp-invalid-server' | 'mcp-invalid-transport' | 'mcp-invalid-env-var';

/**
 * Plugin validator rule IDs
 */
export type PluginRuleId =
  | 'plugin-invalid-manifest'
  | 'plugin-invalid-version'
  | 'plugin-missing-file'
  | 'plugin-circular-dependency'
  | 'plugin-dependency-invalid-version';

/**
 * Commands validator rule IDs
 */
export type CommandsRuleId =
  | 'commands-deprecated-directory'
  | 'commands-migrate-to-skills'
  | 'commands-in-plugin-deprecated';

/**
 * Union of all rule IDs across all validators
 */
export type RuleId =
  | ClaudeMdRuleId
  | SkillsRuleId
  | AgentsRuleId
  | SettingsRuleId
  | HooksRuleId
  | McpRuleId
  | PluginRuleId
  | CommandsRuleId;

/**
 * All valid rule IDs as a constant array for runtime validation
 */
export const ALL_RULE_IDS = [
  // CLAUDE.md rules
  'size-error',
  'size-warning',
  'import-missing',
  'import-circular',
  'import-in-code-block',
  'frontmatter-invalid-paths',
  'rules-circular-symlink',
  'filename-case-sensitive',
  'content-too-many-sections',
  'glob-pattern-backslash',
  'glob-pattern-too-broad',
  'file-not-found',
  // Skills rules
  'skill-missing-shebang',
  'skill-missing-comments',
  'skill-dangerous-command',
  'skill-eval-usage',
  'skill-path-traversal',
  'skill-missing-changelog',
  'skill-missing-examples',
  'skill-missing-version',
  'skill-too-many-files',
  'skill-deep-nesting',
  'skill-naming-inconsistent',
  'skill-time-sensitive-content',
  'skill-body-too-long',
  'skill-large-reference-no-toc',
  // Agents rules
  'agent-hooks-invalid-schema',
  'agent-skills-not-found',
  // Settings rules
  'settings-invalid-schema',
  'settings-invalid-permission',
  'settings-invalid-env-var',
  'settings-permission-invalid-rule',
  'settings-permission-empty-pattern',
  // Hooks rules
  'hooks-invalid-event',
  'hooks-missing-script',
  'hooks-invalid-config',
  // MCP rules
  'mcp-invalid-server',
  'mcp-invalid-transport',
  'mcp-invalid-env-var',
  // Plugin rules
  'plugin-invalid-manifest',
  'plugin-invalid-version',
  'plugin-missing-file',
  'plugin-circular-dependency',
  'plugin-dependency-invalid-version',
  // Commands rules
  'commands-deprecated-directory',
  'commands-migrate-to-skills',
  'commands-in-plugin-deprecated',
] as const;

/**
 * Type guard to check if a string is a valid RuleId
 */
export function isRuleId(value: string): value is RuleId {
  return (ALL_RULE_IDS as readonly string[]).includes(value);
}
