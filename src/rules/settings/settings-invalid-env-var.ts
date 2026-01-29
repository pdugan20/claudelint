/**
 * Rule: settings-invalid-env-var
 *
 * Validates environment variable format in settings.json.
 */

import { Rule } from '../../types/rule';
import { ENV_VAR_NAME_PATTERN } from '../../validators/constants';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

/**
 * Validates environment variable names and values
 */
export const rule: Rule = {
  meta: {
    id: 'settings-invalid-env-var',
    name: 'Settings Invalid Env Var',
    description: 'Environment variables must follow naming conventions',
    category: 'Settings',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-invalid-env-var.md',
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

    if (!config.env) {
      return;
    }

    // Validate each environment variable
    for (const [key, value] of Object.entries(config.env)) {
      // Validate key format (should be uppercase with underscores)
      if (!ENV_VAR_NAME_PATTERN.test(key)) {
        context.report({
          message: `Environment variable name should be uppercase with underscores: ${key}`,
        });
      }

      // Check for empty values
      if (!value || value.trim().length === 0) {
        context.report({
          message: `Empty value for environment variable: ${key}`,
        });
      }

      // Check for potential secrets in plain text
      if (
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('password')
      ) {
        if (!value.startsWith('${') && value.length > 10) {
          context.report({
            message: `Possible hardcoded secret in environment variable: ${key}. Consider using variable expansion.`,
          });
        }
      }
    }
  },
};
