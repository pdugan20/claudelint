/**
 * Rule: settings-permission-empty-pattern
 *
 * Warns when permission rules have empty inline patterns.
 */

import { Rule } from '../../types/rule';
import { permissionEntries, parsePermissionRule } from '../../utils/validators/settings';
import { z } from 'zod';

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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/settings/settings-permission-empty-pattern',
    schema: z.object({
      allowEmpty: z.boolean().optional(),
    }),
    defaultOptions: {
      allowEmpty: false,
    },
    docs: {
      summary: 'Warns when Tool(pattern) permission entries have empty inline patterns.',
      rationale:
        'An empty pattern like Bash() is likely a mistake and causes unexpected permission matching behavior.',
      details:
        'This rule checks permission entries in `settings.json` and `settings.local.json` across the `allow`, ' +
        '`deny`, and `ask` arrays for the `Tool(pattern)` syntax and warns when the ' +
        'pattern inside the parentheses is empty. An empty pattern like `Bash()` is ' +
        'likely a mistake and should either include a glob pattern like `Bash(npm test)` ' +
        'or be simplified to just the tool name `Bash`. Empty patterns may cause ' +
        'unexpected permission matching behavior.',
      examples: {
        incorrect: [
          {
            description: 'Permission with empty inline pattern',
            code:
              '{\n' +
              '  "permissions": {\n' +
              '    "allow": [\n' +
              '      "Bash()",\n' +
              '      "Write()"\n' +
              '    ]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Permission with a specific pattern',
            code:
              '{\n' +
              '  "permissions": {\n' +
              '    "allow": [\n' +
              '      "Bash(npm test)",\n' +
              '      "Write(src/**)"\n' +
              '    ]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Permission without inline pattern syntax',
            code:
              '{\n' +
              '  "permissions": {\n' +
              '    "allow": [\n' +
              '      "Bash",\n' +
              '      "Write"\n' +
              '    ]\n' +
              '  }\n' +
              '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Either add a meaningful pattern inside the parentheses (e.g., `Bash(npm test)`) ' +
        'or remove the parentheses entirely to use the bare tool name (e.g., `Bash`).',
      options: {
        allowEmpty: {
          type: 'boolean',
          description: 'Allow empty inline patterns in Tool(pattern) syntax',
          default: false,
        },
      },
      optionExamples: [
        {
          description: 'Allow empty inline patterns',
          config: { allowEmpty: true },
        },
      ],
      whenNotToUse:
        'Disable this rule or set `allowEmpty: true` if your permission system ' +
        'intentionally uses empty patterns as a wildcard syntax.',
      relatedRules: ['settings-file-path-not-found', 'settings-invalid-env-var'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    if ((options as SettingsPermissionEmptyPatternOptions).allowEmpty) return;
    for (const { name, rule: ruleString } of permissionEntries(filePath, fileContent)) {
      const parsed = parsePermissionRule(ruleString);
      if (parsed?.pattern !== undefined && parsed.pattern.trim().length === 0) {
        context.report({ message: `Empty inline pattern in permissions.${name}: "${ruleString}"` });
      }
    }
  },
};
