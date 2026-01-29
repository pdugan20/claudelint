/**
 * Rule: plugin-version-required
 *
 * Validates that plugin version is required and non-empty
 *
 * The plugin version is a required field used for dependency management
 * and marketplace distribution. It must not be empty or whitespace-only.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/json-helpers';

export const rule: Rule = {
  meta: {
    id: 'plugin-version-required',
    name: 'Plugin Version Required',
    description: 'Plugin version is required and cannot be empty',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-version-required.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    const plugin = safeParseJSON(fileContent);
    if (!plugin) {
      return; // Invalid JSON handled by schema validation
    }

    // Check if version is missing or empty
    if (!plugin.version || typeof plugin.version !== 'string' || plugin.version.trim().length === 0) {
      context.report({
        message: 'Plugin version is required and cannot be empty',
      });
    }
  },
};
