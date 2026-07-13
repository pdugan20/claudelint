/**
 * Rule: plugin-dependency-string-with-marketplace
 *
 * A bare-string dependency is only a plugin name. Plugin names are kebab-case and
 * cannot contain "@", so "name@marketplace" is read as a literal plugin name that
 * cannot exist. Claude Code then drops the entire plugin entry from the marketplace
 * catalog and reports a misleading "not found in marketplace" error.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const rule: Rule = {
  meta: {
    id: 'plugin-dependency-string-with-marketplace',
    name: 'Plugin Dependency String With Marketplace',
    description: 'Bare-string dependency must be a plugin name and cannot contain "@"',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.6.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-dependency-string-with-marketplace',
    docs: {
      recommended: true,
      summary:
        'Flags a bare-string dependency containing "@", which Claude Code reads as a literal plugin name.',
      rationale:
        'A string dependency is only a plugin name, and plugin names are kebab-case with no "@". ' +
        'Claude Code cannot resolve the reference, silently drops the whole plugin entry from the ' +
        'marketplace catalog, and reports "not found in marketplace" - an error that points at the ' +
        'catalog rather than the dependency, making the real cause undiagnosable from the message.',
      details:
        'The "name@marketplace" form is valid CLI syntax (claude plugin install foo@bar), which is ' +
        'why it looks correct in a manifest. It is not valid manifest syntax. To depend on a plugin ' +
        'in another marketplace, use the object form with an explicit marketplace field, and ensure ' +
        'the root marketplace lists that marketplace in allowCrossMarketplaceDependenciesOn.',
      examples: {
        incorrect: [
          {
            description: 'CLI syntax used in a manifest dependency string',
            code: '{\n  "name": "mintlify-docs",\n  "dependencies": ["mintlify@claude-plugins-official"]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Object form with an explicit marketplace',
            code: '{\n  "name": "mintlify-docs",\n  "dependencies": [\n    { "name": "mintlify", "marketplace": "claude-plugins-official" }\n  ]\n}',
            language: 'json',
          },
          {
            description: 'Bare string for a plugin in the same marketplace',
            code: '{\n  "name": "deploy-kit",\n  "dependencies": ["audit-logger"]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace the string with an object: { "name": "<plugin>", "marketplace": "<marketplace>" }. ' +
        'Then add the target marketplace to allowCrossMarketplaceDependenciesOn in the root ' +
        'marketplace.json, or the install will fail with a cross-marketplace error.',
      relatedRules: ['plugin-dependency-not-allowlisted'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    let plugin: PluginManifest;
    try {
      plugin = JSON.parse(fileContent) as PluginManifest;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!Array.isArray(plugin.dependencies)) {
      return;
    }

    for (const dep of plugin.dependencies) {
      if (typeof dep === 'string' && dep.includes('@')) {
        context.report({
          message: `Dependency "${dep}" is not a valid plugin name`,
          fix: 'Use the object form: { "name": "...", "marketplace": "..." }',
        });
      }
    }
  },
};
