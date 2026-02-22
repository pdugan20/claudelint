/**
 * Rule: plugin-marketplace-files-not-found
 *
 * Validates that relative source paths in marketplace.json plugin entries
 * resolve to existing directories with valid plugin structures.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { directoryExists, fileExists } from '../../utils/filesystem/files';
import { dirname, join } from 'path';
import { MarketplaceMetadataSchema } from '../../validators/schemas';

export const rule: Rule = {
  meta: {
    id: 'plugin-marketplace-files-not-found',
    name: 'Plugin Marketplace Files Not Found',
    description: 'Relative plugin source path does not resolve to a valid plugin directory',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-marketplace-files-not-found',
    docs: {
      recommended: true,
      summary:
        'Verifies that relative source paths in marketplace.json plugin entries resolve to existing plugin directories.',
      rationale:
        'Relative source paths that point to missing directories or directories without a plugin.json will prevent plugin installation from the marketplace.',
      details:
        'When a marketplace.json lists plugins with relative path sources (e.g., "./plugins/my-plugin"), ' +
        'this rule checks that the referenced directory exists and contains a .claude-plugin/plugin.json ' +
        'manifest. External sources (github, url, npm, pip) are skipped since they cannot be validated locally.',
      examples: {
        incorrect: [
          {
            description: 'Plugin source points to non-existent directory',
            code: '{\n  "name": "my-marketplace",\n  "owner": { "name": "Dev Team" },\n  "plugins": [\n    {\n      "name": "my-plugin",\n      "source": "./plugins/missing-plugin"\n    }\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Plugin source points to valid plugin directory',
            code: '{\n  "name": "my-marketplace",\n  "owner": { "name": "Dev Team" },\n  "plugins": [\n    {\n      "name": "my-plugin",\n      "source": "./plugins/my-plugin"\n    }\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure relative source paths in plugin entries point to existing directories ' +
        'that contain a .claude-plugin/plugin.json manifest. Create the plugin directory ' +
        'structure or correct the source path.',
      relatedRules: ['plugin-invalid-marketplace-manifest', 'plugin-missing-file'],
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate marketplace.json files
    if (!filePath.endsWith('marketplace.json')) {
      return;
    }

    const marketplaceData = safeParseJSON(fileContent);
    if (!marketplaceData) {
      return; // Invalid JSON handled by plugin-invalid-marketplace-manifest
    }

    const result = MarketplaceMetadataSchema.safeParse(marketplaceData);
    if (!result.success) {
      return; // Schema validation handled by plugin-invalid-marketplace-manifest
    }

    const marketplaceDir = dirname(filePath);

    for (let i = 0; i < result.data.plugins.length; i++) {
      const plugin = result.data.plugins[i];

      // Only check relative path sources (strings), skip external sources (objects)
      if (typeof plugin.source !== 'string') {
        continue;
      }

      const pluginDir = join(marketplaceDir, plugin.source);

      // Check if the directory exists
      if (!(await directoryExists(pluginDir))) {
        context.report({
          message: `plugins[${i}] "${plugin.name}": source directory not found: ${plugin.source}`,
        });
        continue;
      }

      // Check if the directory contains a plugin.json
      const pluginJsonPath = join(pluginDir, '.claude-plugin', 'plugin.json');
      if (!(await fileExists(pluginJsonPath))) {
        context.report({
          message: `plugins[${i}] "${plugin.name}": missing .claude-plugin/plugin.json in ${plugin.source}`,
        });
      }
    }
  },
};
