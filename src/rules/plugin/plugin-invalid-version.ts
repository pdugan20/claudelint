/**
 * Rule: plugin-invalid-version
 *
 * Validates plugin version follows semantic versioning.
 */

import { Rule } from '../../types/rule';
import { isValidSemver } from '../../utils/patterns';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that plugin version follows semver format
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-invalid-version',
    name: 'Plugin Invalid Version',
    description: 'Plugin version must follow semantic versioning format',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-invalid-version',
    docs: {
      recommended: true,
      summary: 'Validates that the plugin version follows semantic versioning format.',
      rationale:
        'Non-semver versions break dependency resolution and make it impossible to communicate breaking changes.',
      details:
        'This rule checks that the version field in plugin.json conforms to the Semantic Versioning ' +
        '(semver) specification. Valid formats include major.minor.patch (e.g., 1.0.0), optional ' +
        'pre-release identifiers (e.g., 2.1.0-beta.1), and optional build metadata (e.g., ' +
        '1.0.0+build.42). Proper semver ensures consistent dependency resolution and clear ' +
        'communication about breaking changes.',
      examples: {
        incorrect: [
          {
            description: 'Version missing the patch number',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0",\n  "description": "A sample plugin"\n}',
            language: 'json',
          },
          {
            description: 'Version with a leading v prefix',
            code: '{\n  "name": "my-plugin",\n  "version": "v2.1.0",\n  "description": "A sample plugin"\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Standard semver version',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "A sample plugin"\n}',
            language: 'json',
          },
          {
            description: 'Pre-release version',
            code: '{\n  "name": "my-plugin",\n  "version": "2.1.0-beta.1",\n  "description": "A sample plugin"\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Update the version field to follow the semver format: MAJOR.MINOR.PATCH. Optionally ' +
        'append a pre-release identifier with a hyphen (e.g., 1.0.0-beta) or build metadata ' +
        'with a plus sign (e.g., 1.0.0+build.1).',
      relatedRules: ['plugin-description-required'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    let plugin: PluginManifest;
    try {
      plugin = JSON.parse(fileContent) as PluginManifest;
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!plugin.version) {
      return; // Required field validation handled by schema
    }

    // Validate semver format
    if (!isValidSemver(plugin.version)) {
      context.report({
        message: `Invalid semantic version: "${plugin.version}"`,
      });
    }
  },
};
