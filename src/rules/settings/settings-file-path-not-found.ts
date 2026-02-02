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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/settings/settings-file-path-not-found.md',
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
