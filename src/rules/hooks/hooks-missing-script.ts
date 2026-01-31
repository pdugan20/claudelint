/**
 * Rule: hooks-missing-script
 *
 * Errors when hook references a script file that doesn't exist.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join, resolve } from 'path';
import { HooksConfigSchema } from '../../validators/schemas';
import { z } from 'zod';

type HooksConfig = z.infer<typeof HooksConfigSchema>;

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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/hooks/hooks-missing-script.md',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Parse JSON
    let config: HooksConfig;
    try {
      config = JSON.parse(fileContent) as HooksConfig;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Validate each hook's command script exists
    if (config.hooks && Array.isArray(config.hooks)) {
      for (const hook of config.hooks) {
        if (hook.type === 'command' && hook.command) {
          await validateCommandScript(context, filePath, hook.command);
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

  // Skip validation for commands with variables
  if (command.includes('${') || command.includes('$')) {
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
