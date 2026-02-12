/**
 * Rule: settings-file-path-not-found
 *
 * Validates that file paths in settings.json actually exist
 *
 * Settings can reference files like apiKeyHelper scripts or outputStyle files.
 * This rule ensures those files exist (unless they contain variables).
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { fileExists } from '../../utils/filesystem/files';
import { hasVariableExpansion } from '../../utils/validators/helpers';
import { hasProperty, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'settings-file-path-not-found',
    name: 'Settings File Path Not Found',
    description: 'Referenced file path does not exist',
    category: 'Settings',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-file-path-not-found.md',
    docs: {
      recommended: true,
      summary: 'Warns when file paths referenced in settings.json do not exist.',
      details:
        'This rule validates that file paths in `settings.json` properties such as ' +
        '`apiKeyHelper` and `outputStyle` point to files that actually exist on disk. ' +
        'Missing files will cause runtime errors when Claude Code tries to use them. ' +
        'Paths containing variable expansion syntax (e.g., `${HOME}/...`) are skipped ' +
        'since they cannot be resolved statically.',
      examples: {
        incorrect: [
          {
            description: 'Settings referencing a non-existent script',
            code:
              '{\n' +
              '  "apiKeyHelper": "/scripts/get-api-key.sh",\n' +
              '  "outputStyle": "./styles/missing-style.md"\n' +
              '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Settings referencing existing files',
            code:
              '{\n' +
              '  "apiKeyHelper": "./scripts/get-api-key.sh",\n' +
              '  "outputStyle": ".claude/styles/concise.md"\n' +
              '}',
            language: 'json',
          },
          {
            description: 'Settings using variable expansion (skipped)',
            code: '{\n' + '  "apiKeyHelper": "${HOME}/.config/claude/api-key-helper.sh"\n' + '}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Verify that the file paths in `settings.json` are correct and the files exist. ' +
        'Check for typos in the path, ensure the file has been created, and confirm the ' +
        'path is relative to the correct base directory.',
      relatedRules: ['settings-invalid-env-var', 'settings-permission-empty-pattern'],
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate settings.json files
    if (!filePath.endsWith('settings.json')) {
      return;
    }

    const settings = safeParseJSON(fileContent);
    if (!settings) {
      return; // Invalid JSON handled by schema validation
    }

    // Validate apiKeyHelper path if present
    if (hasProperty(settings, 'apiKeyHelper') && isString(settings.apiKeyHelper)) {
      await validateFilePath(context, settings.apiKeyHelper, 'apiKeyHelper');
    }

    // Validate outputStyle path if present
    if (hasProperty(settings, 'outputStyle') && isString(settings.outputStyle)) {
      await validateFilePath(context, settings.outputStyle, 'outputStyle');
    }
  },
};

/**
 * Helper function to validate a file path exists
 */
async function validateFilePath(
  context: RuleContext,
  path: string,
  fieldName: string
): Promise<void> {
  // Skip validation for paths with variables
  if (hasVariableExpansion(path)) {
    return;
  }

  const exists = await fileExists(path);
  if (!exists) {
    context.report({
      message: `${fieldName} file not found: ${path}`,
    });
  }
}
