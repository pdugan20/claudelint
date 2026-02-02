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
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

/**
 * Check if permission rule has valid syntax
 */
function hasValidSyntax(rule: string): { valid: boolean; error?: string } {
  // Check for unmatched parentheses
  const openCount = (rule.match(/\(/g) || []).length;
  const closeCount = (rule.match(/\)/g) || []).length;

  if (openCount !== closeCount) {
    return {
      valid: false,
      error: 'Unmatched parentheses',
    };
  }

  // Check for empty tool name
  if (rule.trim().length === 0) {
    return {
      valid: false,
      error: 'Empty permission rule',
    };
  }

  // Check for valid format: Tool or Tool(pattern)
  const validFormat = /^[^()]+$|^[^()]+\([^)]*\)$/;
  if (!validFormat.test(rule)) {
    return {
      valid: false,
      error: 'Invalid format. Use "Tool" or "Tool(pattern)"',
    };
  }

  return { valid: true };
}

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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-permission-invalid-rule.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate settings.json files
    if (!filePath.endsWith('settings.json')) {
      return;
    }

    let config: SettingsConfig;
    try {
      config = JSON.parse(fileContent) as SettingsConfig;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!config.permissions) {
      return;
    }

    // Check all permission arrays (allow, deny, ask)
    const arrays = [
      { name: 'allow', rules: config.permissions.allow || [] },
      { name: 'deny', rules: config.permissions.deny || [] },
      { name: 'ask', rules: config.permissions.ask || [] },
    ];

    for (const { name, rules } of arrays) {
      for (const ruleString of rules) {
        const validation = hasValidSyntax(ruleString);
        if (!validation.valid) {
          context.report({
            message: `Invalid syntax in permissions.${name}: "${ruleString}". ${validation.error}`,
          });
        }
      }
    }
  },
};
