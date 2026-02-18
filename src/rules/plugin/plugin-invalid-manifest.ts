/**
 * Rule: plugin-invalid-manifest
 *
 * Validates marketplace.json schema and referenced files.
 */

import { Rule } from '../../types/rule';
import { fileExists, readFileContent } from '../../utils/filesystem/files';
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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-invalid-manifest',
    docs: {
      recommended: true,
      summary: 'Validates that marketplace.json is well-formed and consistent with plugin.json.',
      rationale:
        'A mismatched version or invalid schema in marketplace.json causes marketplace publishing failures.',
      details:
        'This rule checks the marketplace.json file that accompanies a plugin.json. It verifies that ' +
        'marketplace.json contains valid JSON, conforms to the MarketplaceMetadataSchema, and that its ' +
        'version field matches the version declared in plugin.json. If marketplace.json does not exist, ' +
        'the rule is skipped since it is optional. A mismatched version or invalid schema will cause ' +
        'marketplace publishing issues.',
      examples: {
        incorrect: [
          {
            description: 'marketplace.json with version mismatch',
            code: '// plugin.json\n{\n  "name": "my-plugin",\n  "version": "1.2.0"\n}\n\n// marketplace.json\n{\n  "name": "my-plugin",\n  "version": "1.0.0"\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'marketplace.json with matching version',
            code: '// plugin.json\n{\n  "name": "my-plugin",\n  "version": "1.2.0"\n}\n\n// marketplace.json\n{\n  "name": "my-plugin",\n  "version": "1.2.0",\n  "description": "A useful plugin"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure marketplace.json is valid JSON, follows the expected schema, and has a version that ' +
        'matches plugin.json. Update the version in marketplace.json whenever you bump plugin.json.',
      relatedRules: ['plugin-name-required', 'plugin-version-required'],
    },
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
