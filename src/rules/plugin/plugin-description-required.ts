/**
 * Rule: plugin-description-required
 *
 * Validates that plugin description is required and non-empty
 *
 * The plugin description is a required field that explains what the plugin
 * does to users. It must not be empty or whitespace-only.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'plugin-description-required',
    name: 'Plugin Description Required',
    description: 'Plugin description is required and cannot be empty',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-description-required.md',
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

    // Check if description is missing or empty
    if (
      !hasProperty(plugin, 'description') ||
      !isString(plugin.description) ||
      plugin.description.trim().length === 0
    ) {
      context.report({
        message: 'Plugin description is required and cannot be empty',
      });
    }
  },
};
