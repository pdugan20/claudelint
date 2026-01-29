/**
 * Rule: hooks-invalid-config
 *
 * Validates hook configuration structure and requirements.
 */

import { Rule } from '../../types/rule';
import { VALID_HOOK_TYPES } from '../../schemas/constants';
import { HooksConfigSchema, HookSchema } from '../../validators/schemas';
import { z } from 'zod';

type HooksConfig = z.infer<typeof HooksConfigSchema>;
type Hook = z.infer<typeof HookSchema>;

/**
 * Validates hook configuration structure
 */
export const rule: Rule = {
  meta: {
    id: 'hooks-invalid-config',
    name: 'Hooks Invalid Config',
    description: 'Hook configuration must be valid',
    category: 'Hooks',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/hooks/hooks-invalid-config.md',
  },

  validate: async (context) => {
    const { fileContent } = context;

    // Parse JSON
    let config: HooksConfig;
    try {
      config = JSON.parse(fileContent) as HooksConfig;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Validate each hook
    if (config.hooks && Array.isArray(config.hooks)) {
      for (const hook of config.hooks) {
        validateHook(context, hook);
      }
    }
  },
};

function validateHook(context: Parameters<Rule['validate']>[0], hook: Hook): void {
  // Validate hook type
  if (!VALID_HOOK_TYPES.includes(hook.type as any)) {
    context.report({
      message: `Invalid hook type: ${hook.type}. Must be one of: ${VALID_HOOK_TYPES.join(', ')}`,
    });
  }

  // Validate hook has required field for its type
  if (hook.type === 'command' && !hook.command) {
    context.report({
      message: 'Hook with type "command" must have "command" field',
    });
  }

  if (hook.type === 'prompt' && !hook.prompt) {
    context.report({
      message: 'Hook with type "prompt" must have "prompt" field',
    });
  }

  if (hook.type === 'agent' && !hook.agent) {
    context.report({
      message: 'Hook with type "agent" must have "agent" field',
    });
  }

  // Validate matcher pattern if present
  if (hook.matcher?.pattern) {
    try {
      new RegExp(hook.matcher.pattern);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      context.report({
        message: `Invalid regex pattern in matcher: ${errorMsg}`,
      });
    }
  }
}
