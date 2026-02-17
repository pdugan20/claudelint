/**
 * Rule: plugin-missing-component-paths
 *
 * Warns when plugin.json component paths don't start with ./.
 * Component paths should be relative to the plugin root and start with ./
 * to be explicit about their location.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

const COMPONENT_FIELDS = [
  'skills',
  'agents',
  'commands',
  'outputStyles',
  'hooks',
  'mcpServers',
  'lspServers',
];

/**
 * Normalize a field value to an array of strings
 */
function toStringArray(value: unknown): string[] {
  if (isString(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter(isString);
  }
  return [];
}

export const rule: Rule = {
  meta: {
    id: 'plugin-missing-component-paths',
    name: 'Plugin Missing Component Paths',
    description: 'Plugin component paths should start with ./ to be explicit about their location',
    category: 'Plugin',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-missing-component-paths.md',
    docs: {
      recommended: true,
      summary: 'Warns when plugin component paths do not start with "./".',
      rationale:
        'Paths without "./" prefix are ambiguous and may be misinterpreted as absolute or module paths.',
      details:
        'Component paths in plugin.json (skills, agents, commands, outputStyles, hooks, mcpServers, lspServers) should start with ' +
        '"./" to make it explicit that they are relative to the plugin root. Paths without the ' +
        'leading "./" prefix are ambiguous and may be misinterpreted. This rule is auto-fixable ' +
        'and will prepend "./" to paths that lack it.',
      examples: {
        incorrect: [
          {
            description: 'Skills path missing the ./ prefix',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "skills": [\n    ".claude/skills"\n  ]\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Skills path with the ./ prefix',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "skills": [\n    "./.claude/skills"\n  ]\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Prepend "./" to any component path that does not already start with it. For example, ' +
        'change ".claude/skills" to "./.claude/skills".',
      relatedRules: ['plugin-missing-file', 'plugin-components-wrong-location'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate plugin.json files
    if (!filePath.endsWith('plugin.json')) {
      return;
    }

    const plugin = safeParseJSON(fileContent);
    if (!plugin || !isObject(plugin)) {
      return;
    }

    for (const field of COMPONENT_FIELDS) {
      if (!hasProperty(plugin, field)) {
        continue;
      }

      const paths = toStringArray(plugin[field]);

      for (const path of paths) {
        if (!path.startsWith('./')) {
          context.report({
            message: `${field} path missing "./" prefix: "${path}"`,
            fix: `Change "${path}" to "./${path}"`,
          });
        }
      }
    }
  },
};
