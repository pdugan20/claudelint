/**
 * Rule: commands-in-plugin-deprecated
 *
 * Warns that the commands field in plugin.json is deprecated.
 */

import { Rule } from '../../types/rule';
import { PluginManifestSchema } from '../../validators/schemas';
import { z } from 'zod';

type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * Validates that plugin doesn't use deprecated commands field
 */
export const rule: Rule = {
  meta: {
    id: 'commands-in-plugin-deprecated',
    name: 'Commands In Plugin Deprecated',
    description: 'The commands field in plugin.json is deprecated',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/commands-in-plugin-deprecated.md',
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

    // Warn if commands field is present and non-empty
    if (plugin.commands && plugin.commands.length > 0) {
      context.report({
        message:
          'The "commands" field in plugin.json is deprecated. Please migrate to "skills" instead. ' +
          'Skills provide better structure, versioning, and documentation.',
      });
    }
  },
};
