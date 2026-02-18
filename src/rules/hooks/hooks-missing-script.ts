/**
 * Rule: hooks-missing-script
 *
 * Errors when hook references a script file that doesn't exist.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join, resolve } from 'path';

/**
 * Validates hook script file existence
 */
export const rule: Rule = {
  meta: {
    id: 'hooks-missing-script',
    name: 'Hooks Missing Script',
    description: 'Hook scripts must reference existing files',
    category: 'Hooks',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/hooks/hooks-missing-script',
    docs: {
      recommended: true,
      summary: 'Errors when a hook command references a script file that does not exist.',
      rationale:
        'A missing script causes the hook to fail at runtime, breaking the automation workflow.',
      details:
        'This rule checks that hook commands pointing to relative script paths (starting with ./ or ../) ' +
        'reference files that actually exist on disk. It skips validation for inline shell commands ' +
        '(containing spaces or shell operators), commands with variable expansions, and absolute paths ' +
        'or commands expected to be in PATH. A missing script will cause the hook to fail at runtime, ' +
        'breaking the intended automation workflow.',
      examples: {
        incorrect: [
          {
            description: 'Hook referencing a script that does not exist',
            code: '{\n  "hooks": {\n    "PreToolUse": [\n      {\n        "matcher": "*",\n        "hooks": [{ "type": "command", "command": "./scripts/missing.sh" }]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Hook referencing an existing script file',
            code: '{\n  "hooks": {\n    "PreToolUse": [\n      {\n        "matcher": "*",\n        "hooks": [{ "type": "command", "command": "./scripts/lint.sh" }]\n      }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Verify the script path is correct and the file exists. Create the missing script file if ' +
        'needed, or update the command to point to the correct location.',
      relatedRules: ['hooks-invalid-event'],
    },
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Parse JSON
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(fileContent) as Record<string, unknown>;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Navigate object-keyed format: hooks -> event -> matcher groups -> hook handlers
    if (config.hooks && typeof config.hooks === 'object' && !Array.isArray(config.hooks)) {
      const hooksObj = config.hooks as Record<string, unknown>;
      for (const matcherGroups of Object.values(hooksObj)) {
        if (!Array.isArray(matcherGroups)) continue;
        for (const matcherGroup of matcherGroups as Record<string, unknown>[]) {
          const handlers = matcherGroup.hooks;
          if (!Array.isArray(handlers)) continue;
          for (const hook of handlers as Record<string, unknown>[]) {
            if (hook.type === 'command' && typeof hook.command === 'string') {
              await validateCommandScript(context, filePath, hook.command);
            }
          }
        }
      }
    }
  },
};

async function validateCommandScript(
  context: Parameters<Rule['validate']>[0],
  filePath: string,
  command: string
): Promise<void> {
  // Skip validation for inline commands (contain spaces or shell operators)
  if (
    command.includes(' ') ||
    command.includes('&&') ||
    command.includes('||') ||
    command.includes('|')
  ) {
    return;
  }

  // Skip validation for commands with variable expansion
  if (/\$\{[A-Z_]+\}|\$[A-Z_]+\b/.test(command)) {
    return;
  }

  // Check if it's a relative path script
  if (command.startsWith('./') || command.startsWith('../')) {
    const baseDir = dirname(filePath);
    const scriptPath = resolve(join(baseDir, command));

    const exists = await fileExists(scriptPath);
    if (!exists) {
      context.report({
        message: `Hook script not found: ${command}`,
      });
    }
  }

  // For absolute paths or commands in PATH, we can't reliably check without executing
  // So we skip validation for those
}
