/**
 * Rule: plugin-dependency-invalid-version
 *
 * Validates plugin dependency versions follow semver range format.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that dependency versions use valid semver ranges
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-dependency-invalid-version',
    name: 'Plugin Dependency Invalid Version',
    description: 'Plugin dependency versions must use valid semver ranges',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-dependency-invalid-version.md',
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

    if (!plugin.dependencies) {
      return;
    }

    // Validate each dependency version
    for (const [depName, depVersion] of Object.entries(plugin.dependencies)) {
      if (!isValidSemverRange(depVersion)) {
        context.report({
          message: `Invalid semver range for dependency "${depName}": ${depVersion}`,
        });
      }
    }
  },
};

/**
 * Validates semver range format
 * Supports: exact (1.0.0), caret (^1.0.0), tilde (~1.0.0), range (>=1.0.0 <2.0.0)
 */
function isValidSemverRange(version: string): boolean {
  const semverRangePattern =
    /^(\^|~|>=?|<=?|=)?\s*\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\s+(<=?|>=?)\s*\d+\.\d+\.\d+)?$/;
  return semverRangePattern.test(version.trim());
}
