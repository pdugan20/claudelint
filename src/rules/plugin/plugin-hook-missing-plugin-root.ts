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

/**
 * Check inline hooks object for missing plugin root
 */
function checkInlineHooks(hooks: Record<string, unknown>, report: (msg: string) => void): void {
  for (const [eventName, eventHooks] of Object.entries(hooks)) {
    if (!Array.isArray(eventHooks)) continue;

    for (const hook of eventHooks) {
      if (!isObject(hook)) continue;

      if (hasProperty(hook, 'command') && isString(hook.command)) {
        if (isScriptPathMissingRoot(hook.command)) {
          report(
            `Hook "${eventName}" references script path without \${CLAUDE_PLUGIN_ROOT}: ${hook.command}`
          );
        }
      }
    }
  }
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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/plugin/plugin-hook-missing-plugin-root.md',
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

    // hooks can be a string (path to hooks.json) or an inline object
    if (isString(hooks)) {
      // If it's a path to hooks.json, check it uses CLAUDE_PLUGIN_ROOT
      if (isScriptPathMissingRoot(hooks)) {
        context.report({
          message: `Plugin hooks path should use \${CLAUDE_PLUGIN_ROOT}: ${hooks}`,
        });
      }
    } else if (isObject(hooks)) {
      // Inline hooks object - check each hook command
      checkInlineHooks(hooks, (msg) => {
        context.report({ message: msg });
      });
    }
  },
};
