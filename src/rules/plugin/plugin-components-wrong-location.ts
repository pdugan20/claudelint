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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-components-wrong-location.md',
    docs: {
      recommended: true,
      summary: 'Warns when plugin components are placed in .claude-plugin/ instead of .claude/.',
      details:
        'Plugin components such as skills, agents, hooks, and commands should be located in the ' +
        '.claude/ directory. The .claude-plugin/ directory is reserved for plugin metadata like ' +
        'plugin.json and marketplace.json. Placing components in .claude-plugin/ may cause them ' +
        'to not be discovered correctly by Claude Code.',
      examples: {
        incorrect: [
          {
            description: 'Skills placed in .claude-plugin/ directory',
            code:
              'my-plugin/\n' +
              '  .claude-plugin/\n' +
              '    plugin.json\n' +
              '    skills/         <-- wrong location\n' +
              '      my-skill/',
          },
        ],
        correct: [
          {
            description: 'Skills placed in .claude/ directory',
            code:
              'my-plugin/\n' +
              '  .claude-plugin/\n' +
              '    plugin.json\n' +
              '  .claude/\n' +
              '    skills/           <-- correct location\n' +
              '      my-skill/',
          },
        ],
      },
      howToFix:
        'Move the component directories (skills, agents, hooks, commands) from .claude-plugin/ ' +
        'to .claude/ and update any path references in plugin.json accordingly.',
      relatedRules: ['plugin-json-wrong-location', 'plugin-missing-file'],
    },
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
