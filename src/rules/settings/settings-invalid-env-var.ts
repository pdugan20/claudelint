/**
 * Rule: settings-invalid-env-var
 *
 * Validates environment variable format in settings.json.
 */

import { Rule } from '../../types/rule';
import { SettingsSchema } from '../../validators/schemas';
import { z } from 'zod';

type SettingsConfig = z.infer<typeof SettingsSchema>;

// Regex pattern for environment variable name validation
const ENV_VAR_NAME_PATTERN = /^[A-Z][A-Z0-9_]*$/;

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
    docs: {
      recommended: true,
      summary: 'Validates environment variable naming and detects potential hardcoded secrets.',
      details:
        'This rule checks the `env` object in `settings.json` for three issues: ' +
        '(1) environment variable names that do not follow the `UPPER_CASE_WITH_UNDERSCORES` ' +
        'convention (must start with a letter and contain only uppercase letters, digits, ' +
        'and underscores), (2) empty or whitespace-only values, and (3) potential hardcoded ' +
        'secrets in variables whose names contain "secret", "key", "token", or "password". ' +
        'Secrets should use variable expansion syntax instead of plain text values.',
      examples: {
        incorrect: [
          {
            description: 'Lowercase env var name and empty value',
            code:
              '{\n' +
              '  "env": {\n' +
              '    "myApiUrl": "https://api.example.com",\n' +
              '    "EMPTY_VAR": ""\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Hardcoded secret value',
            code:
              '{\n' +
              '  "env": {\n' +
              '    "API_SECRET_KEY": "sk-abc123def456ghi789"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Proper env var naming with variable expansion for secrets',
            code:
              '{\n' +
              '  "env": {\n' +
              '    "API_URL": "https://api.example.com",\n' +
              '    "API_SECRET_KEY": "${CLAUDE_API_KEY}"\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Rename environment variables to use `UPPER_CASE_WITH_UNDERSCORES` format. ' +
        'Remove or provide values for empty entries. For sensitive values, use variable ' +
        'expansion syntax like `${SYSTEM_ENV_VAR}` instead of hardcoding secrets.',
      relatedRules: ['settings-file-path-not-found', 'settings-permission-empty-pattern'],
    },
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
