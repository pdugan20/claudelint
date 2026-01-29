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
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Only validate settings.json files
    if (!filePath.endsWith('settings.json')) {
      return;
    }

    let config: SettingsConfig;
    try {
      config = JSON.parse(fileContent);
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!config.permissions) {
      return;
    }

    // Validate each permission rule
    for (const rule of config.permissions) {
      // Parse Tool(pattern) syntax if present
      const toolPatternMatch = rule.tool.match(/^([^(]+)\(([^)]*)\)$/);

      if (toolPatternMatch) {
        const inlinePattern = toolPatternMatch[2].trim();

        // Warn if inline pattern is empty
        if (inlinePattern.length === 0) {
          context.report({
            message: `Empty inline pattern in Tool(pattern) syntax: ${rule.tool}`,
          });
        }
      }
    }
  },
};
