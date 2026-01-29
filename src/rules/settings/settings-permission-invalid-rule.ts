/**
 * Rule: settings-permission-invalid-rule
 *
 * Validates Tool(pattern) syntax in permission rules.
 */

import { Rule } from '../../types/rule';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

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
        const toolName = toolPatternMatch[1].trim();
        const inlinePattern = toolPatternMatch[2].trim();

        // Check if both inline pattern and separate pattern field are specified
        if (inlinePattern && rule.pattern) {
          context.report({
            message:
              `Permission rule has both inline pattern "${inlinePattern}" in tool field and separate pattern field "${rule.pattern}". ` +
              `Use only one format: either "tool": "${toolName}(${inlinePattern})" OR "tool": "${toolName}", "pattern": "${rule.pattern}"`,
          });
        }
      }
    }
  },
};
