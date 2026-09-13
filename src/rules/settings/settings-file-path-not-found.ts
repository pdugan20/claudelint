/**
 * Rule: settings-file-path-not-found
 *
 * Validates that file paths in settings.json and settings.local.json actually exist
 *
 * Settings can reference files like apiKeyHelper scripts.
 * This rule ensures those files exist (unless they contain variables).
 */

import { basename, dirname, isAbsolute, resolve } from 'path';
import { Rule, RuleContext } from '../../types/rule';
import { readSettings } from '../../utils/validators/settings';
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
    docUrl: 'https://claudelint.com/rules/settings/settings-file-path-not-found',
    docs: {
      recommended: true,
      summary:
        'Warns when file paths referenced in settings.json and settings.local.json do not exist.',
      rationale:
        'Missing file paths cause runtime errors when Claude Code attempts to load the referenced resource.',
      details:
        'This rule validates that the `apiKeyHelper` path in `settings.json` and `settings.local.json` points to a file ' +
        'that actually exists on disk when the helper is a plain path. Shell command lines and commands on PATH are skipped. Project-relative paths resolve from the project root. ' +
        'Missing files will cause runtime errors when Claude Code tries to use them. ' +
        'Paths containing variable expansion syntax (e.g., `${HOME}/...`) or home expansion (`~/...`) are skipped ' +
        'since they cannot be resolved statically.',
      examples: {
        incorrect: [
          {
            description: 'Settings referencing a non-existent script',
            code: '{\n' + '  "apiKeyHelper": "/scripts/get-api-key.sh"\n' + '}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Settings referencing existing files',
            code: '{\n' + '  "apiKeyHelper": "./scripts/get-api-key.sh"\n' + '}',
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
        'Verify that the file paths in `settings.json` and `settings.local.json` are correct and the files exist. ' +
        'Check for typos in the path, ensure the file has been created, and confirm the ' +
        'path is relative to the correct base directory.',
      relatedRules: ['settings-invalid-env-var', 'settings-permission-empty-pattern'],
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    const settings = readSettings(filePath, fileContent);
    if (!settings) {
      return; // Invalid JSON handled by schema validation
    }

    // Validate apiKeyHelper path if present
    if (hasProperty(settings, 'apiKeyHelper') && isString(settings.apiKeyHelper)) {
      await validateFilePath(context, settings.apiKeyHelper, 'apiKeyHelper');
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
  if (hasVariableExpansion(path) || path.startsWith('~')) {
    return;
  }

  // apiKeyHelper is a shell command. Only stat a plain path; commands on PATH and
  // compound/quoted commands cannot be resolved reliably without executing them.
  if (/[\s"'`|&;<>()=*?{}[\]]/.test(path) || (!isAbsolute(path) && !path.includes('/'))) return;
  const configDir = dirname(context.filePath);
  const baseDir = basename(configDir) === '.claude' ? dirname(configDir) : configDir;
  const exists = await fileExists(resolve(baseDir, path));
  if (!exists) {
    context.report({
      message: `${fieldName} file not found: ${path}`,
    });
  }
}
