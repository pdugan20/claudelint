/**
 * Rule: plugin-version-required
 *
 * Validates that plugin version is required and non-empty
 *
 * The plugin version is a required field used for dependency management
 * and marketplace distribution. It must not be empty or whitespace-only.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isString } from '../../utils/type-guards';

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
    docs: {
      recommended: true,
      summary: 'Requires that plugin.json contains a non-empty version field.',
      details:
        'This rule checks that the plugin.json file has a version property that is a non-empty string. ' +
        'The version is used for dependency management and marketplace distribution. A missing or empty ' +
        'version prevents proper version tracking, update detection, and may cause installation failures.',
      examples: {
        incorrect: [
          {
            description: 'Plugin with missing version',
            code: '{\n  "name": "my-plugin",\n  "description": "A useful plugin"\n}',
            language: 'json',
          },
          {
            description: 'Plugin with empty version',
            code: '{\n  "name": "my-plugin",\n  "version": ""\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin with a valid version',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a version field to plugin.json with a non-empty string value, ideally following semver ' +
        'format (e.g., "1.0.0").',
      relatedRules: ['plugin-invalid-manifest'],
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

    // Check if version is missing or empty
    if (
      !hasProperty(plugin, 'version') ||
      !isString(plugin.version) ||
      plugin.version.trim().length === 0
    ) {
      context.report({
        message: 'Plugin version is required and cannot be empty',
      });
    }
  },
};
