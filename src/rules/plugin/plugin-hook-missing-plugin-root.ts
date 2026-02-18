/**
 * Rule: plugin-hook-missing-plugin-root
 *
 * Errors when plugin hooks reference scripts without ${CLAUDE_PLUGIN_ROOT}.
 * Plugin hooks must use ${CLAUDE_PLUGIN_ROOT} to ensure scripts are found
 * regardless of where the plugin is installed.
 */

import { Rule, RuleContext } from '../../types/rule';
import { safeParseJSON } from '../../utils/formats/json';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

/**
 * Check if a command string references a script path without ${CLAUDE_PLUGIN_ROOT}
 */
function isScriptPathMissingRoot(command: string): boolean {
  // Skip if it already uses CLAUDE_PLUGIN_ROOT
  if (command.includes('${CLAUDE_PLUGIN_ROOT}')) {
    return false;
  }

  // Check for relative script paths (./scripts/..., scripts/..., ./hooks/...)
  if (/(?:^|\s)\.?\.?\/\S+/.test(command)) {
    return true;
  }

  return false;
}

export const rule: Rule = {
  meta: {
    id: 'plugin-hook-missing-plugin-root',
    name: 'Plugin Hook Missing Plugin Root',
    description:
      'Plugin hooks must use ${CLAUDE_PLUGIN_ROOT} when referencing scripts to ensure portability',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-hook-missing-plugin-root',
    docs: {
      recommended: true,
      summary:
        'Requires plugin hook scripts to use ${CLAUDE_PLUGIN_ROOT} for portable path references.',
      rationale:
        'Relative paths break when the plugin is installed elsewhere; ${CLAUDE_PLUGIN_ROOT} ensures portability.',
      details:
        'Plugin hooks that reference script files via relative paths (e.g., ./scripts/lint.sh) ' +
        'will break when the plugin is installed in a different location. This rule ensures that ' +
        'hook commands use the ${CLAUDE_PLUGIN_ROOT} variable to form absolute paths that resolve ' +
        'correctly regardless of where the plugin is installed.',
      examples: {
        incorrect: [
          {
            description: 'Hook using a relative script path without ${CLAUDE_PLUGIN_ROOT}',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [\n          {\n            "type": "command",\n            "command": "./scripts/post-tool.sh"\n          }\n        ]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Hook using ${CLAUDE_PLUGIN_ROOT} for the script path',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [\n          {\n            "type": "command",\n            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/post-tool.sh"\n          }\n        ]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace relative script paths in hook commands with paths that start with ' +
        '${CLAUDE_PLUGIN_ROOT}. For example, change "./scripts/lint.sh" to ' +
        '"${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh".',
      relatedRules: ['plugin-missing-file'],
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

    if (!hasProperty(plugin, 'hooks')) {
      return;
    }

    const hooks = plugin.hooks;

    // hooks is a string path or array of string paths
    const hookPaths = isString(hooks)
      ? [hooks]
      : Array.isArray(hooks)
        ? hooks.filter(isString)
        : [];
    for (const hookPath of hookPaths) {
      if (isScriptPathMissingRoot(hookPath)) {
        context.report({
          message: `Hooks path missing \${CLAUDE_PLUGIN_ROOT}: ${hookPath}`,
        });
      }
    }
  },
};
