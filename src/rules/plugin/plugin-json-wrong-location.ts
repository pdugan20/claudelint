/**
 * Rule: plugin-json-wrong-location
 *
 * Validates that plugin.json is inside .claude-plugin/ directory, not at repository root
 *
 * The plugin.json file must be at .claude-plugin/plugin.json to be properly
 * discovered by Claude Code. It should not be at the repository root.
 *
 * Reference: https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure
 */

import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'plugin-json-wrong-location',
    name: 'Plugin JSON Wrong Location',
    description: 'plugin.json must be in .claude-plugin/ directory, not at repository root',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-json-wrong-location',
    docs: {
      recommended: true,
      summary: 'Ensures plugin.json is inside the .claude-plugin/ directory.',
      rationale:
        'A misplaced plugin.json is not discovered by Claude Code, making the plugin invisible.',
      details:
        'The plugin.json manifest must be located at .claude-plugin/plugin.json for Claude Code ' +
        'to discover the plugin. Placing it at the repository root or any other location will ' +
        'cause the plugin to not be recognized. This rule checks whether the file path includes ' +
        'the .claude-plugin/ directory segment.',
      examples: {
        incorrect: [
          {
            description: 'plugin.json placed at the repository root',
            code:
              'my-plugin/\n' +
              '  plugin.json        <-- wrong location\n' +
              '  .claude/\n' +
              '    skills/',
          },
        ],
        correct: [
          {
            description: 'plugin.json inside .claude-plugin/ directory',
            code:
              'my-plugin/\n' +
              '  .claude-plugin/\n' +
              '    plugin.json      <-- correct location\n' +
              '  .claude/\n' +
              '    skills/',
          },
        ],
      },
      howToFix:
        'Move plugin.json to the .claude-plugin/ directory at the root of your plugin repository ' +
        'so it resides at .claude-plugin/plugin.json.',
      relatedRules: ['plugin-components-wrong-location'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    // Check if plugin.json is NOT inside .claude-plugin/ directory
    if (!filePath.includes('.claude-plugin/')) {
      context.report({
        message: 'plugin.json must be at .claude-plugin/plugin.json, not at repository root',
      });
    }
  },
};
