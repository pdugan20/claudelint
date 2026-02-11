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
    docs: {
      recommended: true,
      summary: 'Requires plugin.json to include a non-empty description field.',
      details:
        'The description field in plugin.json tells users what the plugin does. This rule ensures ' +
        'the field is present, is a string, and is not empty or whitespace-only. A clear description ' +
        'is essential for plugin discoverability and for users evaluating whether to install the plugin.',
      examples: {
        incorrect: [
          {
            description: 'Plugin with a missing description',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0"\n}',
            language: 'json',
          },
          {
            description: 'Plugin with an empty description',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": ""\n}',
            language: 'json',
          },
          {
            description: 'Plugin with a whitespace-only description',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "   "\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin with a meaningful description',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "Provides code review skills for TypeScript projects"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a description field with a clear, concise summary of what the plugin provides. ' +
        "Aim for one to two sentences that help users understand the plugin's purpose.",
      relatedRules: ['plugin-invalid-version'],
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
