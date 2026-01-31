/**
 * Rule: settings-invalid-permission
 *
 * Validates permission action values in settings.json.
 */

import { Rule } from '../../types/rule';
import { VALID_PERMISSION_ACTIONS } from '../../schemas/constants';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

/**
 * Validates that permission actions are valid
 */
export const rule: Rule = {
  meta: {
    id: 'settings-invalid-permission',
    name: 'Settings Invalid Permission',
    description: 'Permission rules must use valid action values',
    category: 'Settings',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-invalid-permission.md',
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

    // Validate each permission rule
    for (const rule of config.permissions) {
      if (!(VALID_PERMISSION_ACTIONS as readonly string[]).includes(rule.action)) {
        context.report({
          message: `Invalid permission action: ${rule.action}. Must be one of: ${VALID_PERMISSION_ACTIONS.join(', ')}`,
        });
      }
    }
  },
};
