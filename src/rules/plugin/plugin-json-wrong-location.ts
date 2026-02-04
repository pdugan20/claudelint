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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-json-wrong-location.md',
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
