/**
 * Rule: plugin-circular-dependency
 *
 * Detects circular dependencies in plugin manifests.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that plugin doesn't have circular dependencies
 */
export const rule: Rule = {
  meta: {
    id: 'plugin-circular-dependency',
    name: 'Plugin Circular Dependency',
    description: 'Plugin must not have circular dependencies',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-circular-dependency.md',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    let plugin: PluginManifest;
    try {
      plugin = JSON.parse(fileContent);
    } catch {
      return; // JSON parse errors handled by schema validation
    }

    if (!plugin.dependencies || !plugin.name) {
      return;
    }

    const pluginName = plugin.name;

    // Check for direct self-dependency
    for (const depName of Object.keys(plugin.dependencies)) {
      if (depName === pluginName) {
        context.report({
          message: `Circular dependency detected: ${pluginName} → ${depName}`,
        });
      }

      // Note: Detection of indirect circular dependencies (A → B → C → A) would require
      // fetching dependency manifests from a registry, which is not implemented here.
      // This rule only catches direct self-dependencies.
    }
  },
};
