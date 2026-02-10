/**
 * Rule: hooks-invalid-config
 *
 * Validates hook configuration structure and requirements.
 */

import { Rule } from '../../types/rule';
import { VALID_HOOK_TYPES } from '../../schemas/constants';

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

  validate: (context) => {
    const { fileContent } = context;

    // Parse JSON
    let config: Record<string, unknown>;
    try {
      config = JSON.parse(fileContent) as Record<string, unknown>;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Validate each hook in the object-keyed format
    if (config.hooks && typeof config.hooks === 'object' && !Array.isArray(config.hooks)) {
      const hooksObj = config.hooks as Record<string, unknown>;
      for (const matcherGroups of Object.values(hooksObj)) {
        if (!Array.isArray(matcherGroups)) continue;
        for (const matcherGroup of matcherGroups as Record<string, unknown>[]) {
          const handlers = matcherGroup.hooks;
          if (!Array.isArray(handlers)) continue;
          for (const hook of handlers as Record<string, unknown>[]) {
            validateHookHandler(context, hook);
          }
        }
      }
    }
  },
};

function validateHookHandler(
  context: Parameters<Rule['validate']>[0],
  hook: Record<string, unknown>
): void {
  // Validate hook type
  if (!(VALID_HOOK_TYPES as readonly string[]).includes(hook.type as string)) {
    context.report({
      message: `Invalid hook type: ${String(hook.type)}. Must be one of: ${VALID_HOOK_TYPES.join(', ')}`,
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

  // Validate mutual exclusivity of handler fields
  const fieldCount = [hook.command, hook.prompt, hook.agent].filter(Boolean).length;
  if (fieldCount > 1) {
    context.report({
      message: 'Hook cannot have multiple handler fields (command, prompt, agent)',
    });
  }

  // Validate timeout if present
  if (hook.timeout !== undefined && typeof hook.timeout === 'number' && hook.timeout <= 0) {
    context.report({
      message: `Invalid timeout value: ${hook.timeout}. Must be positive`,
    });
  }
}
