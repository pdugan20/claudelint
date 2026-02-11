/**
 * Rule: hooks-invalid-event
 *
 * Warns when hooks configuration uses unknown or invalid event names.
 */

import { Rule } from '../../types/rule';
import { VALID_HOOK_EVENTS } from '../../schemas/constants';

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
    docs: {
      recommended: true,
      summary: 'Warns when a hook configuration uses an unknown or invalid event name.',
      details:
        'This rule validates that the keys in the hooks object of settings.json correspond to recognized ' +
        'Claude Code hook events. Valid events include PreToolUse, PostToolUse, PostToolUseFailure, ' +
        'PermissionRequest, UserPromptSubmit, Notification, Stop, SubagentStart, SubagentStop, and ' +
        'PreCompact. An unrecognized event name means the hook will never fire, silently failing to ' +
        'provide the intended automation.',
      examples: {
        incorrect: [
          {
            description: 'Hook using a misspelled event name',
            code: '{\n  "hooks": {\n    "BeforeToolUse": [\n      { "matcher": "*", "hooks": [{ "type": "command", "command": "./lint.sh" }] }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Hook using a valid event name',
            code: '{\n  "hooks": {\n    "PreToolUse": [\n      { "matcher": "*", "hooks": [{ "type": "command", "command": "./lint.sh" }] }\n    ]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Replace the invalid event name with one of the recognized hook events: PreToolUse, ' +
        'PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Notification, Stop, ' +
        'SubagentStart, SubagentStop, or PreCompact.',
      relatedRules: ['hooks-missing-script'],
    },
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

    // In object-keyed format, event names are the keys of the hooks object
    if (config.hooks && typeof config.hooks === 'object' && !Array.isArray(config.hooks)) {
      for (const eventName of Object.keys(config.hooks as Record<string, unknown>)) {
        if (!(VALID_HOOK_EVENTS as readonly string[]).includes(eventName)) {
          context.report({
            message: `Unknown hook event: ${eventName}. Valid events: ${VALID_HOOK_EVENTS.join(', ')}`,
          });
        }
      }
    }
  },
};
