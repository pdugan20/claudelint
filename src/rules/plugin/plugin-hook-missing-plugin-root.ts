/**
 * Rule: plugin-hook-missing-plugin-root
 *
 * Errors when inline plugin hook commands reference scripts without ${CLAUDE_PLUGIN_ROOT}.
 * Plugin hook commands must use ${CLAUDE_PLUGIN_ROOT} to ensure scripts are found
 * regardless of where the plugin is installed.
 *
 * Note: String/array hook file paths in plugin.json are resolved relative to the
 * plugin root by the plugin system and do NOT need ${CLAUDE_PLUGIN_ROOT}.
 * Only inline object hook commands need this variable.
 *
 * This rule was disabled on the premise that inline hook objects in plugin.json were
 * rejected at runtime. That premise is false as of Claude Code 2.1.208, verified by firing
 * a real SessionStart hook: inline objects are accepted AND they fire. What actually fails
 * is a hook whose command uses a relative path -- it silently never runs, and
 * `claude plugin validate --strict` passes it. That silent failure is exactly what this
 * rule catches, and nothing else does (#40).
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
    description: 'Inline hook commands must use ${CLAUDE_PLUGIN_ROOT} for portable script paths',
    category: 'Plugin',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/plugin/plugin-hook-missing-plugin-root',
    docs: {
      recommended: true,
      summary:
        'Requires inline plugin hook commands to use ${CLAUDE_PLUGIN_ROOT} for portable path references.',
      rationale:
        'A hook command with a relative path silently never fires, and `claude plugin validate` ' +
        'passes it, so nothing else catches this; ${CLAUDE_PLUGIN_ROOT} makes the path resolve.',
      details:
        'This rule checks inline hook definitions in plugin.json for command-type hooks that ' +
        'reference script files via relative paths. These commands must use ${CLAUDE_PLUGIN_ROOT} ' +
        'to form absolute paths that resolve correctly regardless of where the plugin is installed. ' +
        'String and array hook file paths are resolved by the plugin system and do not need this variable.',
      examples: {
        incorrect: [
          {
            description: 'Inline hook command using a relative path without ${CLAUDE_PLUGIN_ROOT}',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [\n          {\n            "type": "command",\n            "command": "./scripts/post-tool.sh"\n          }\n        ]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Inline hook command using ${CLAUDE_PLUGIN_ROOT}',
            code: '{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My plugin",\n  "hooks": {\n    "PostToolUse": [\n      {\n        "matcher": "Write",\n        "hooks": [\n          {\n            "type": "command",\n            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/post-tool.sh"\n          }\n        ]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace relative script paths in inline hook commands with paths that start with ' +
        '${CLAUDE_PLUGIN_ROOT}. For example, change `./scripts/lint.sh` to ' +
        '`${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh`.',
      whenNotToUse:
        'There is no good reason to disable this. A hook command that omits ${CLAUDE_PLUGIN_ROOT} ' +
        'does not fire, and it fails silently: the plugin loads, the hook never runs, and no ' +
        'error is printed.',
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

    // String or string[] paths: these are file references resolved relative to plugin root
    // by the plugin system. No ${CLAUDE_PLUGIN_ROOT} check needed.
    if (isString(hooks) || Array.isArray(hooks)) {
      return;
    }

    // Inline object: walk hook events -> matchers -> hooks -> check commands
    if (isObject(hooks)) {
      for (const [, matchers] of Object.entries(hooks)) {
        if (!Array.isArray(matchers)) continue;
        for (const matcher of matchers) {
          if (!isObject(matcher) || !hasProperty(matcher, 'hooks')) continue;
          const matcherHooks = matcher.hooks;
          if (!Array.isArray(matcherHooks)) continue;
          for (const hook of matcherHooks) {
            if (!isObject(hook)) continue;
            if (
              hasProperty(hook, 'type') &&
              hook.type === 'command' &&
              hasProperty(hook, 'command') &&
              isString(hook.command)
            ) {
              if (isScriptPathMissingRoot(hook.command)) {
                context.report({
                  message: `Hook command missing \${CLAUDE_PLUGIN_ROOT}: ${hook.command}`,
                });
              }
            }
          }
        }
      }
    }
  },
};
