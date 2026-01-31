/**
 * Rule: plugin-json-wrong-location
 *
 * Validates that plugin.json is at repository root, not inside .claude-plugin/
 *
 * The plugin.json file should be at the repository root to be properly
 * discovered by Claude Code. It should not be inside the .claude-plugin/ directory.
 */

import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'plugin-json-wrong-location',
    name: 'Plugin JSON Wrong Location',
    description: 'plugin.json should be at repository root, not inside .claude-plugin/',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/plugin/plugin-json-wrong-location.md',
  },
  validate: (context: RuleContext) => {
    const { filePath } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    // Check if plugin.json is inside .claude-plugin/ directory
    if (filePath.includes('.claude-plugin/')) {
      context.report({
        message: 'plugin.json should be at the repository root, not inside .claude-plugin/',
      });
    }
  },
};
