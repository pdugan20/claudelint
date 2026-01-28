/**
 * Centralized rule registration for all validators
 * All validation rules are defined and registered here
 */

import { RuleRegistry } from '../utils/rule-registry';
import { z } from 'zod';

/**
 * CLAUDE.md Validator Rules
 */
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size limit',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: z.object({
    maxSize: z.number().positive().int().optional(),
  }),
  defaultOptions: {
    maxSize: 40000, // 40KB
  },
});

RuleRegistry.register({
  id: 'size-warning',
  name: 'File Size Warning',
  description: 'CLAUDE.md approaching file size limit',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: z.object({
    maxSize: z.number().positive().int().optional(),
  }),
  defaultOptions: {
    maxSize: 35000, // 35KB
  },
});

RuleRegistry.register({
  id: 'import-missing',
  name: 'Missing Import',
  description: '@import directive points to non-existent file',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'import-circular',
  name: 'Circular Import',
  description: 'Circular @import dependencies detected',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
  schema: z.object({
    maxDepth: z.number().int().positive().optional(),
    allowSelfReference: z.boolean().optional(),
    ignorePatterns: z.array(z.string()).optional(),
  }),
  defaultOptions: {
    maxDepth: 5,
    allowSelfReference: false,
    ignorePatterns: [],
  },
});

RuleRegistry.register({
  id: 'content-too-many-sections',
  name: 'Too Many Sections',
  description: 'CLAUDE.md has too many sections',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'glob-pattern-backslash',
  name: 'Backslash in Glob Pattern',
  description: 'Glob pattern uses backslashes instead of forward slashes',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'glob-pattern-too-broad',
  name: 'Glob Pattern Too Broad',
  description: 'Glob pattern is very broad (** or *)',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'filename-case-sensitive',
  name: 'Case Sensitive Filename Collision',
  description: 'Filenames differ only in case',
  category: 'CLAUDE.md',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'import-in-code-block',
  name: 'Import in Code Block',
  description: 'Import statement found inside code block',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'file-not-found',
  name: 'File Not Found',
  description: 'Specified file does not exist',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'rules-circular-symlink',
  name: 'Circular Symlink',
  description: 'Circular symlink detected in imports',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * Skills Validator Rules
 */
RuleRegistry.register({
  id: 'skill-missing-shebang',
  name: 'Missing Shebang',
  description: 'Shell script missing shebang line',
  category: 'Skills',
  severity: 'warn',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-comments',
  name: 'Missing Comments',
  description: 'File lacks explanatory comments',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-dangerous-command',
  name: 'Dangerous Command',
  description: 'Dangerous shell command detected (rm -rf, dd, mkfs)',
  category: 'Skills',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-eval-usage',
  name: 'Eval Usage',
  description: 'Use of eval/exec detected',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-path-traversal',
  name: 'Path Traversal',
  description: 'Potential path traversal vulnerability',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-changelog',
  name: 'Missing CHANGELOG',
  description: 'Skill missing CHANGELOG.md',
  category: 'Skills',
  severity: 'warn',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-examples',
  name: 'Missing Examples',
  description: 'Skill missing usage examples',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-version',
  name: 'Missing Version',
  description: 'Skill missing version field',
  category: 'Skills',
  severity: 'warn',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-too-many-files',
  name: 'Too Many Files',
  description: 'Too many loose files in skill directory',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-deep-nesting',
  name: 'Deep Nesting',
  description: 'Excessive directory nesting in skill',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-naming-inconsistent',
  name: 'Inconsistent Naming',
  description: 'Inconsistent naming conventions',
  category: 'Skills',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * Settings Validator Rules
 */
RuleRegistry.register({
  id: 'settings-invalid-schema',
  name: 'Invalid Schema',
  description: 'Settings file does not match JSON schema',
  category: 'Settings',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-invalid-permission',
  name: 'Invalid Permission',
  description: 'Permission rule has invalid action or pattern',
  category: 'Settings',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-invalid-env-var',
  name: 'Invalid Environment Variable',
  description: 'Environment variable name or value is invalid',
  category: 'Settings',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-permission-invalid-rule',
  name: 'Invalid Permission Rule',
  description: 'Permission rule has conflicting pattern specifications',
  category: 'Settings',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'settings-permission-empty-pattern',
  name: 'Empty Permission Pattern',
  description: 'Permission rule has empty inline pattern',
  category: 'Settings',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * Hooks Validator Rules
 */
RuleRegistry.register({
  id: 'hooks-invalid-event',
  name: 'Invalid Event',
  description: 'Hook event name is not recognized',
  category: 'Hooks',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'hooks-missing-script',
  name: 'Missing Script',
  description: 'Hook references non-existent script file',
  category: 'Hooks',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'hooks-invalid-config',
  name: 'Invalid Configuration',
  description: 'Hook configuration is malformed',
  category: 'Hooks',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * MCP Validator Rules
 */
RuleRegistry.register({
  id: 'mcp-invalid-server',
  name: 'Invalid Server',
  description: 'MCP server configuration is invalid',
  category: 'MCP',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'mcp-invalid-transport',
  name: 'Invalid Transport',
  description: 'MCP transport configuration is invalid',
  category: 'MCP',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'mcp-invalid-env-var',
  name: 'Invalid Environment Variable',
  description: 'Environment variable usage or expansion is invalid',
  category: 'MCP',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * Plugin Validator Rules
 */
RuleRegistry.register({
  id: 'plugin-invalid-manifest',
  name: 'Invalid Manifest',
  description: 'Plugin manifest does not match schema',
  category: 'Plugin',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'plugin-invalid-version',
  name: 'Invalid Version',
  description: 'Plugin version is not valid semver',
  category: 'Plugin',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'plugin-missing-file',
  name: 'Missing File',
  description: 'Plugin references non-existent file',
  category: 'Plugin',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'plugin-circular-dependency',
  name: 'Circular Dependency',
  description: 'Plugin has circular dependency',
  category: 'Plugin',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'plugin-dependency-invalid-version',
  name: 'Invalid Dependency Version',
  description: 'Plugin dependency has invalid semver version',
  category: 'Plugin',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

/**
 * Commands Validator Rules
 */
RuleRegistry.register({
  id: 'commands-deprecated-directory',
  name: 'Deprecated Commands Directory',
  description: 'Commands directory is deprecated, use Skills instead',
  category: 'Commands',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'commands-migrate-to-skills',
  name: 'Migrate to Skills',
  description: 'Commands should be migrated to Skills',
  category: 'Commands',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'commands-in-plugin-deprecated',
  name: 'Commands in Plugin Deprecated',
  description: 'Commands in plugin.json are deprecated',
  category: 'Commands',
  severity: 'warn',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});
