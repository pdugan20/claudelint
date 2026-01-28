/**
 * Centralized rule registration for all validators
 * All validation rules are defined and registered here
 */

import { RuleRegistry } from '../utils/rule-registry';

/**
 * CLAUDE.md Validator Rules
 */
RuleRegistry.register({
  id: 'size-error',
  name: 'File Size Error',
  description: 'CLAUDE.md exceeds maximum file size limit (40KB)',
  category: 'CLAUDE.md',
  severity: 'error',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'size-warning',
  name: 'File Size Warning',
  description: 'CLAUDE.md approaching file size limit (35KB)',
  category: 'CLAUDE.md',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
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
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-comments',
  name: 'Missing Comments',
  description: 'File lacks explanatory comments',
  category: 'Skills',
  severity: 'warning',
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
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-path-traversal',
  name: 'Path Traversal',
  description: 'Potential path traversal vulnerability',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-changelog',
  name: 'Missing CHANGELOG',
  description: 'Skill missing CHANGELOG.md',
  category: 'Skills',
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-examples',
  name: 'Missing Examples',
  description: 'Skill missing usage examples',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-missing-version',
  name: 'Missing Version',
  description: 'Skill missing version field',
  category: 'Skills',
  severity: 'warning',
  fixable: true,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-too-many-files',
  name: 'Too Many Files',
  description: 'Too many loose files in skill directory',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-deep-nesting',
  name: 'Deep Nesting',
  description: 'Excessive directory nesting in skill',
  category: 'Skills',
  severity: 'warning',
  fixable: false,
  deprecated: false,
  since: '1.0.0',
});

RuleRegistry.register({
  id: 'skill-naming-inconsistent',
  name: 'Inconsistent Naming',
  description: 'Inconsistent naming conventions',
  category: 'Skills',
  severity: 'warning',
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
  severity: 'warning',
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
  severity: 'warning',
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
