/**
 * Rule: settings-permission-invalid-rule
 *
 * Validates Tool(pattern) syntax in permission rules.
 *
 * Valid formats:
 * - "Tool" - matches all uses of tool
 * - "Tool(pattern)" - matches specific pattern
 *
 * Examples:
 * - "Bash" - all bash commands
 * - "Bash(npm run *)" - npm run with wildcard
 * - "Read(~/.zshrc)" - specific file
 * - "WebFetch(domain:example.com)" - specific domain
 */

import { Rule } from '../../types/rule';
import { permissionEntries, parsePermissionRule } from '../../utils/validators/settings';

/**
 * Validates Tool(pattern) syntax in permission rules
 */
export const rule: Rule = {
  meta: {
    id: 'settings-permission-invalid-rule',
    name: 'Settings Permission Invalid Rule',
    description: 'Permission rules must use valid Tool(pattern) syntax',
    category: 'Settings',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/settings/settings-permission-invalid-rule',
    docs: {
      recommended: true,
      summary: 'Validates that permission rules use correct Tool(pattern) syntax.',
      rationale:
        'Invalid Tool(pattern) syntax causes the permission rule to be silently ignored, leaving tools unrestricted.',
      details:
        'This rule checks the syntax of permission rule strings in settings.json and settings.local.json. Each rule must ' +
        'be either a plain tool name like "Bash" or a tool name with a pattern like "Bash(npm run *)". ' +
        'It checks the outer delimiter, empty rule strings, and MCP specifiers ignored in settings. Parentheses inside a specifier are literal. Incorrect syntax ' +
        'prevents the permission system from matching commands properly, which can lead to unexpected ' +
        'access behavior.',
      examples: {
        incorrect: [
          {
            description: 'Permission rule with unmatched parentheses',
            code: '{\n  "permissions": {\n    "allow": ["Bash(npm run build"]\n  }\n}',
            language: 'json',
          },
          {
            description: 'Empty permission rule string',
            code: '{\n  "permissions": {\n    "deny": [""]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Valid permission rules with proper syntax',
            code: '{\n  "permissions": {\n    "allow": ["Bash(npm run *)", "Read", "WebFetch(domain:example.com)"]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure each permission rule uses the format "Tool" or "Tool(pattern)". Check for outer ' +
        'parentheses and non-empty values. Remove any trailing or leading whitespace.',
      relatedRules: ['settings-invalid-permission'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    for (const { name, rule: ruleString } of permissionEntries(filePath, fileContent)) {
      const parsed = parsePermissionRule(ruleString);
      if (!parsed) {
        context.report({
          message: `Invalid syntax in permissions.${name}: "${ruleString}". ${ruleString.trim() ? 'Unmatched parentheses or invalid outer delimiter' : 'Empty permission rule'}`,
        });
      } else if (parsed.tool.startsWith('mcp__') && parsed.pattern !== undefined) {
        context.report({
          message: `MCP permission specifiers are ignored in settings: "${ruleString}"`,
        });
      }
    }
  },
};
