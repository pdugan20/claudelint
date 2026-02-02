/**
 * Rule: settings-permission-empty-pattern
 *
 * Warns when permission rules have empty inline patterns.
 */

import { Rule } from '../../types/rule';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

/**
 * Options for settings-permission-empty-pattern rule
 */
export interface SettingsPermissionEmptyPatternOptions {
  /** Allow empty inline patterns in Tool(pattern) syntax (default: false) */
  allowEmpty?: boolean;
}

/**
 * Validates that inline patterns in Tool(pattern) syntax are not empty
 */
export const rule: Rule = {
  meta: {
    id: 'settings-permission-empty-pattern',
    name: 'Settings Permission Empty Pattern',
    description: 'Tool(pattern) syntax should not have empty patterns',
    category: 'Settings',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-permission-empty-pattern.md',
    schema: z.object({
      allowEmpty: z.boolean().optional(),
    }),
    defaultOptions: {
      allowEmpty: false,
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

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

    const allowEmpty = (options as SettingsPermissionEmptyPatternOptions).allowEmpty ?? false;

    // Skip validation if empty patterns are allowed
    if (allowEmpty) {
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
        // Parse Tool(pattern) syntax if present
        const toolPatternMatch = ruleString.match(/^([^(]+)\(([^)]*)\)$/);

        if (toolPatternMatch) {
          const inlinePattern = toolPatternMatch[2].trim();

          // Warn if inline pattern is empty
          if (inlinePattern.length === 0) {
            context.report({
              message: `Empty inline pattern in permissions.${name}: "${ruleString}". Use "${toolPatternMatch[1]}" instead of "${ruleString}"`,
            });
          }
        }
      }
    }
  },
};
