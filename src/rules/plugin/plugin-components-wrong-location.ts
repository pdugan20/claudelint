/**
 * Rule: plugin-components-wrong-location
 *
 * Validates that plugin components are in .claude/ not .claude-plugin/
 *
 * Plugin components (skills, agents, hooks, commands) should be located in
 * the .claude/ directory, not .claude-plugin/. The .claude-plugin/ directory
 * is reserved for plugin metadata.
 */

import { Rule, RuleContext } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join } from 'path';

export const rule: Rule = {
  meta: {
    id: 'plugin-components-wrong-location',
    name: 'Plugin Components Wrong Location',
    description: 'Plugin components should be in .claude/ not .claude-plugin/',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/plugin/plugin-components-wrong-location.md',
  },
  validate: async (context: RuleContext) => {
    const { filePath } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    // Get the plugin root directory (parent of plugin.json)
    const pluginRoot = dirname(filePath);

    // Check each component type
    const componentsToCheck = ['skills', 'agents', 'hooks', 'commands'];
    for (const component of componentsToCheck) {
      const wrongPath = join(pluginRoot, '.claude-plugin', component);
      if (await fileExists(wrongPath)) {
        context.report({
          message: `${component} directory should be in .claude/${component}, not .claude-plugin/${component}`,
        });
      }
    }
  },
};
