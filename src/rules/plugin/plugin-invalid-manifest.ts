/**
 * Rule: plugin-invalid-manifest
 *
 * Validates marketplace.json schema and referenced files.
 */

import { Rule } from '../../types/rule';
import { fileExists, readFileContent } from '../../utils/file-system';
import { dirname, join } from 'path';
import { MarketplaceMetadataSchema } from '../../validators/schemas';

/**
 * Validates marketplace.json metadata
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-invalid-manifest',
    name: 'Plugin Invalid Manifest',
    description: 'marketplace.json must be valid and reference existing files',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/plugin/plugin-invalid-manifest.md',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files (we check for marketplace.json from here)
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    const pluginRoot = dirname(filePath);
    const marketplacePath = join(pluginRoot, 'marketplace.json');

    // marketplace.json is optional
    if (!(await fileExists(marketplacePath))) {
      return;
    }

    // Read marketplace.json
    let marketplaceContent: string;
    try {
      marketplaceContent = await readFileContent(marketplacePath);
    } catch {
      return; // File read errors will be caught elsewhere
    }

    // Parse JSON
    let marketplaceData: unknown;
    try {
      marketplaceData = JSON.parse(marketplaceContent);
    } catch (err) {
      context.report({
        message: `marketplace.json: Invalid JSON syntax: ${err instanceof Error ? err.message : String(err)}`,
      });
      return;
    }

    // Validate against schema
    const result = MarketplaceMetadataSchema.safeParse(marketplaceData);
    if (!result.success) {
      for (const issue of result.error.issues) {
        context.report({
          message: `marketplace.json: ${issue.path.join('.')}: ${issue.message}`,
        });
      }
      return;
    }

    // Validate that marketplace version matches plugin version
    let pluginData: unknown;
    try {
      pluginData = JSON.parse(fileContent);
    } catch {
      return; // Plugin JSON errors handled elsewhere
    }

    if (pluginData && typeof pluginData === 'object' && 'version' in pluginData) {
      const pluginVersion = (pluginData as { version: string }).version;
      if (result.data.version !== pluginVersion) {
        context.report({
          message: `marketplace.json version (${result.data.version}) does not match plugin.json version (${pluginVersion})`,
        });
      }
    }
  },
};
