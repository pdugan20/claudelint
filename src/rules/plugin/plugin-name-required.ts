/**
 * Rule: plugin-name-required
 *
 * Validates that plugin name is required and non-empty
 *
 * The plugin name is a required field that identifies the plugin
 * in the marketplace and must not be empty or whitespace-only.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'plugin-name-required',
    name: 'Plugin Name Required',
    description: 'Plugin name is required and cannot be empty',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-name-required',
    docs: {
      recommended: true,
      summary: 'Requires that plugin.json contains a non-empty name field.',
      rationale:
        'A missing name prevents the plugin from being discovered, installed, or referenced by Claude Code.',
      details:
        'This rule checks that the plugin.json file has a name property that is a non-empty string. ' +
        'The plugin name is the primary identifier used in the marketplace and by Claude Code when ' +
        'referencing the plugin. A missing or empty name prevents the plugin from being discovered, ' +
        'installed, or referenced correctly.',
      examples: {
        incorrect: [
          {
            description: 'Plugin with missing name',
            code: '{\n  "version": "1.0.0",\n  "description": "A useful plugin"\n}',
            language: 'json',
          },
          {
            description: 'Plugin with empty name',
            code: '{\n  "name": "",\n  "version": "1.0.0"\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin with a valid name',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a name field to plugin.json with a descriptive, non-empty string value that identifies ' +
        'the plugin.',
      relatedRules: ['plugin-invalid-marketplace-manifest'],
    },
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
    if (!hasProperty(plugin, 'name') || !isString(plugin.name) || plugin.name.trim().length === 0) {
      context.report({
        message: 'Plugin name is required and cannot be empty',
      });
    }
  },
};
