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

const COMPONENT_FIELDS = ['skills', 'agents', 'commands', 'outputStyles'];

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
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-missing-component-paths.md',
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
            message: `Plugin ${field} path "${path}" should start with "./"`,
            fix: `Change "${path}" to "./${path}"`,
          });
        }
      }
    }
  },
};
