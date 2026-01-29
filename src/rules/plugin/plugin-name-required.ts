/**
 * Rule: plugin-name-required
 *
 * Validates that plugin name is required and non-empty
 *
 * The plugin name is a required field that identifies the plugin
 * in the marketplace and must not be empty or whitespace-only.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/json-helpers';

export const rule: Rule = {
  meta: {
    id: 'plugin-name-required',
    name: 'Plugin Name Required',
    description: 'Plugin name is required and cannot be empty',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-name-required.md',
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

    // Check if name is missing or empty
    if (!plugin.name || typeof plugin.name !== 'string' || plugin.name.trim().length === 0) {
      context.report({
        message: 'Plugin name is required and cannot be empty',
      });
    }
  },
};
