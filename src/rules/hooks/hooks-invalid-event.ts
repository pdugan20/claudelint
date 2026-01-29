/**
 * Rule: hooks-invalid-event
 *
 * Warns when hooks configuration uses unknown or invalid event names.
 */

import { Rule } from '../../types/rule';
import { VALID_HOOK_EVENTS } from '../../schemas/constants';
import { HooksConfigSchema } from '../../validators/schemas';
import { z } from 'zod';

type HooksConfig = z.infer<typeof HooksConfigSchema>;

/**
 * Validates hook event names
 */
export const rule: Rule = {
  meta: {
    id: 'hooks-invalid-event',
    name: 'Hooks Invalid Event',
    description: 'Hook events must be valid event names',
    category: 'Hooks',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/hooks/hooks-invalid-event.md',
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

    // Validate each hook's event
    if (config.hooks && Array.isArray(config.hooks)) {
      for (const hook of config.hooks) {
        if (hook.event && !VALID_HOOK_EVENTS.includes(hook.event as any)) {
          context.report({
            message: `Unknown hook event: ${hook.event}. Valid events: ${VALID_HOOK_EVENTS.join(', ')}`,
          });
        }
      }
    }
  },
};
