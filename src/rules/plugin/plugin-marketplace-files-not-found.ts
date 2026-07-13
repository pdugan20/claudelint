/**
 * Rule: plugin-marketplace-files-not-found
 *
 * Validates that relative source paths in marketplace.json plugin entries
 * resolve to existing directories with valid plugin structures.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { directoryExists, fileExists } from '../../utils/filesystem/files';
import { basename, dirname, join } from 'path';
import { MarketplaceMetadataSchema } from '../../validators/schemas';

/**
 * Resolve the marketplace root — the directory relative sources are resolved against.
 *
 * Per the official docs, a relative source "resolves relative to the marketplace root, not the
 * `.claude-plugin/` directory": `./plugins/my-plugin` in `<repo>/.claude-plugin/marketplace.json`
 * points at `<repo>/plugins/my-plugin`.
 * https://code.claude.com/docs/en/plugin-marketplaces#relative-paths
 */
function getMarketplaceRoot(filePath: string): string {
  const dir = dirname(filePath);
  return basename(dir) === '.claude-plugin' ? dirname(dir) : dir;
}

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
        'manifest. Relative sources resolve against the marketplace root - the directory containing ' +
        '.claude-plugin/ - not the .claude-plugin/ directory itself, and metadata.pluginRoot is prepended ' +
        'when present. External sources (github, url, npm, pip) are skipped since they cannot be ' +
        'validated locally.',
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

    // metadata.pluginRoot is prepended to relative source paths (default: the marketplace root)
    const sourceRoot = join(getMarketplaceRoot(filePath), result.data.metadata?.pluginRoot ?? '.');

    for (let i = 0; i < result.data.plugins.length; i++) {
      const plugin = result.data.plugins[i];

      // Only check relative path sources (strings), skip external sources (objects)
      if (typeof plugin.source !== 'string') {
        continue;
      }

      const pluginDir = join(sourceRoot, plugin.source);

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
