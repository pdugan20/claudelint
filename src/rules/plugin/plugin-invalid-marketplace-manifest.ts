/**
 * Rule: plugin-invalid-marketplace-manifest
 *
 * Validates marketplace.json schema against the official spec.
 * https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema
 */

import { Rule } from '../../types/rule';
import { MarketplaceMetadataSchema } from '../../validators/schemas';

/**
 * Validates marketplace.json structure and content
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-invalid-marketplace-manifest',
    name: 'Plugin Invalid Marketplace Manifest',
    description: 'marketplace.json must conform to the marketplace schema',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-invalid-marketplace-manifest',
    docs: {
      recommended: true,
      summary: 'Validates that marketplace.json conforms to the official marketplace schema.',
      rationale:
        'An invalid marketplace.json prevents plugin discovery and installation via the marketplace system.',
      details:
        'This rule validates marketplace.json files against the official Claude Code marketplace schema. ' +
        'A valid marketplace.json requires a name, owner (with name), and plugins array. Each plugin ' +
        'entry must have a name and source. The rule checks JSON syntax, schema conformance, and that ' +
        'each plugin entry has the required fields.',
      examples: {
        incorrect: [
          {
            description: 'marketplace.json missing required owner field',
            code: '{\n  "name": "my-marketplace",\n  "plugins": []\n}',
            language: 'json',
          },
          {
            description: 'Plugin entry missing required source field',
            code: '{\n  "name": "my-marketplace",\n  "owner": { "name": "Dev Team" },\n  "plugins": [\n    { "name": "my-plugin" }\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Valid marketplace.json with relative path source',
            code: '{\n  "name": "my-marketplace",\n  "owner": { "name": "Dev Team" },\n  "plugins": [\n    {\n      "name": "my-plugin",\n      "source": "./plugins/my-plugin",\n      "description": "A useful plugin"\n    }\n  ]\n}',
            language: 'json',
          },
          {
            description: 'Valid marketplace.json with GitHub source',
            code: '{\n  "name": "my-marketplace",\n  "owner": { "name": "Dev Team" },\n  "plugins": [\n    {\n      "name": "my-plugin",\n      "source": { "source": "github", "repo": "owner/repo" }\n    }\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure marketplace.json has the required fields: name (string), owner (object with name), ' +
        'and plugins (array). Each plugin entry needs name and source. See the ' +
        '[official docs](https://code.claude.com/docs/en/plugin-marketplaces#marketplace-schema).',
      relatedRules: ['plugin-marketplace-files-not-found'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate marketplace.json files
    if (!filePath.endsWith('marketplace.json')) {
      return;
    }

    // Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(fileContent);
    } catch (err) {
      context.report({
        message: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
      });
      return;
    }

    // Validate against schema
    const result = MarketplaceMetadataSchema.safeParse(data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        context.report({
          message: `${path}${issue.message}`,
        });
      }
      return;
    }

    // Validate each plugin entry has name and source (already enforced by schema,
    // but provide clearer messages)
    for (let i = 0; i < result.data.plugins.length; i++) {
      const plugin = result.data.plugins[i];
      if (!plugin.name) {
        context.report({
          message: `plugins[${i}]: Missing required field "name"`,
        });
      }
      if (!plugin.source) {
        context.report({
          message: `plugins[${i}]: Missing required field "source"`,
        });
      }
    }
  },
};
