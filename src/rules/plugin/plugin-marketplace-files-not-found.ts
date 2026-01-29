/**
 * Rule: plugin-marketplace-files-not-found
 *
 * Validates that files referenced in marketplace.json actually exist
 *
 * Plugins can include a marketplace.json file that references icon, screenshots,
 * readme, and changelog files. This rule ensures those files exist.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/json-helpers';
import { fileExists } from '../../utils/file-system';
import { dirname, join } from 'path';
import { MarketplaceMetadataSchema } from '../../validators/schemas';

export const rule: Rule = {
  meta: {
    id: 'plugin-marketplace-files-not-found',
    name: 'Plugin Marketplace Files Not Found',
    description: 'Referenced marketplace file does not exist',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-marketplace-files-not-found.md',
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate marketplace.json files
    if (!filePath.endsWith('marketplace.json')) {
      return;
    }

    const marketplaceData = safeParseJSON(fileContent);
    if (!marketplaceData) {
      return; // Invalid JSON handled by schema validation
    }

    const result = MarketplaceMetadataSchema.safeParse(marketplaceData);
    if (!result.success) {
      return; // Schema validation handled by plugin-invalid-manifest rule
    }

    const pluginRoot = dirname(filePath);

    // Validate icon path if present
    if (result.data.icon) {
      const iconPath = join(pluginRoot, result.data.icon);
      if (!(await fileExists(iconPath))) {
        context.report({
          message: `Icon file not found: ${result.data.icon}`,
        });
      }
    }

    // Validate screenshot paths if present
    if (result.data.screenshots) {
      for (const screenshot of result.data.screenshots) {
        const screenshotPath = join(pluginRoot, screenshot);
        if (!(await fileExists(screenshotPath))) {
          context.report({
            message: `Screenshot file not found: ${screenshot}`,
          });
        }
      }
    }

    // Validate readme path if present
    if (result.data.readme) {
      const readmePath = join(pluginRoot, result.data.readme);
      if (!(await fileExists(readmePath))) {
        context.report({
          message: `Readme file not found: ${result.data.readme}`,
        });
      }
    }

    // Validate changelog path if present
    if (result.data.changelog) {
      const changelogPath = join(pluginRoot, result.data.changelog);
      if (!(await fileExists(changelogPath))) {
        context.report({
          message: `Changelog file not found: ${result.data.changelog}`,
        });
      }
    }
  },
};
