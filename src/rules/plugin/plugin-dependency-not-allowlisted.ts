/**
 * Rule: plugin-dependency-not-allowlisted
 *
 * Claude Code refuses to auto-install a dependency that lives in a different
 * marketplace than the plugin declaring it, unless the root marketplace lists that
 * marketplace in allowCrossMarketplaceDependenciesOn.
 */

import { Rule } from '../../types/rule';
import { MarketplaceMetadataSchema } from '../../validators/schemas';
import { z } from 'zod';

type Marketplace = z.infer<typeof MarketplaceMetadataSchema>;

export const rule: Rule = {
  meta: {
    id: 'plugin-dependency-not-allowlisted',
    name: 'Plugin Dependency Not Allowlisted',
    description: 'Cross-marketplace dependency requires allowCrossMarketplaceDependenciesOn',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.6.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-dependency-not-allowlisted',
    docs: {
      recommended: true,
      summary:
        'Flags a plugin depending on another marketplace without the root marketplace allowing it.',
      rationale:
        'By default Claude Code refuses to auto-install a dependency from a marketplace the user has ' +
        'not reviewed. This prevents one marketplace from silently pulling in plugins from an ' +
        'unvetted source. Without the allowlist, install fails with a cross-marketplace error.',
      details:
        'Only the root marketplace allowlist is consulted - the marketplace hosting the plugin being ' +
        'installed - so trust does not chain through intermediate marketplaces. This rule can only ' +
        'fire when the marketplace manifest is present in the scanned tree; a plugin published from ' +
        'a separate repository cannot be checked here.',
      examples: {
        incorrect: [
          {
            description: 'Dependency on another marketplace with no allowlist',
            code: '{\n  "name": "acme-tools",\n  "owner": { "name": "Acme" },\n  "plugins": [\n    {\n      "name": "deploy-kit",\n      "source": "./deploy-kit",\n      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]\n    }\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Target marketplace listed in the allowlist',
            code: '{\n  "name": "acme-tools",\n  "owner": { "name": "Acme" },\n  "allowCrossMarketplaceDependenciesOn": ["acme-shared"],\n  "plugins": [\n    {\n      "name": "deploy-kit",\n      "source": "./deploy-kit",\n      "dependencies": [{ "name": "audit-logger", "marketplace": "acme-shared" }]\n    }\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add the target marketplace name to allowCrossMarketplaceDependenciesOn in marketplace.json.',
      relatedRules: ['plugin-dependency-string-with-marketplace'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('marketplace.json')) {
      return;
    }

    let manifest: Marketplace;
    try {
      manifest = JSON.parse(fileContent) as Marketplace;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    const allowed = new Set(manifest.allowCrossMarketplaceDependenciesOn ?? []);
    const self = manifest.name;

    for (const entry of manifest.plugins ?? []) {
      for (const dep of entry.dependencies ?? []) {
        if (typeof dep === 'string' || !dep.marketplace) {
          continue; // Same-marketplace by definition
        }
        if (dep.marketplace === self || allowed.has(dep.marketplace)) {
          continue;
        }
        context.report({
          message: `Dependency on marketplace "${dep.marketplace}" is not allowlisted`,
          fix: `Add "${dep.marketplace}" to allowCrossMarketplaceDependenciesOn`,
        });
      }
    }
  },
};
