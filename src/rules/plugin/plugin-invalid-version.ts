/**
 * Rule: plugin-invalid-version
 *
 * Validates plugin version follows semantic versioning.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

// Regex pattern for semantic versioning validation
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/plugin/plugin-invalid-version.md',
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
    if (!SEMVER_PATTERN.test(plugin.version)) {
      context.report({
        message: `Invalid semantic version: ${plugin.version}. Must follow semver format (e.g., 1.0.0, 2.1.3-beta)`,
      });
    }
  },
};
