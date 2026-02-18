/**
 * Rule: agent-hooks-invalid-schema
 *
 * Validates that hooks in agents.json have correct structure and required fields.
 *
 * This validation is implemented in AgentsValidator.validateFrontmatter() which uses
 * the shared validateSettingsHooks() utility from validation-helpers.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-hooks-invalid-schema',
    name: 'Agent Hooks Invalid Schema',
    description: 'Hook configuration in agents.json violates schema requirements',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-hooks-invalid-schema',
    docs: {
      recommended: true,
      summary:
        'Validates that hook definitions in agent configuration ' +
        'conform to the required schema.',
      rationale:
        'Invalid hook schemas cause silent failures or runtime errors when the agent framework processes events.',
      details:
        'This rule checks that hooks declared in agents.json have ' +
        'the correct structure and all required fields. Hook objects ' +
        'must include valid event names (e.g., PreToolUse, PostToolUse, ' +
        'SessionStart, TaskCompleted) and properly structured matchers. Validation ' +
        'is performed by AgentsValidator.validateFrontmatter() ' +
        'using the shared validateSettingsHooks() utility. Invalid ' +
        'hook schemas cause runtime failures when the agent ' +
        'framework attempts to register event handlers.',
      examples: {
        incorrect: [
          {
            description: 'Hook with missing required command field',
            code:
              '{\n  "hooks": {\n    "PreToolUse": [\n' +
              '      { "matcher": "Bash" }\n' +
              '    ]\n  }\n}',
            language: 'json',
          },
          {
            description: 'Hook with invalid event name',
            code:
              '{\n  "hooks": {\n    "OnStart": [\n' +
              '      { "matcher": ".*", "command": "echo hi" }\n' +
              '    ]\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Properly structured hook with all required fields',
            code:
              '{\n  "hooks": {\n    "PreToolUse": [\n' +
              '      { "matcher": "Bash", ' +
              '"command": "echo pre-check" }\n' +
              '    ]\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Ensure each hook entry has a valid event name key ' +
        '(PreToolUse, PostToolUse, PostToolUseFailure, ' +
        'PermissionRequest, UserPromptSubmit, Notification, Stop, ' +
        'SubagentStart, SubagentStop, PreCompact, SessionStart, ' +
        'SessionEnd, TeammateIdle, or TaskCompleted) and that each ' +
        'matcher object includes the required fields.',
      relatedRules: ['agent-hooks', 'hooks-invalid-event'],
    },
  },
  validate: () => {
    // No-op: Validation implemented in AgentsValidator.validateFrontmatter()
    // Uses shared validateSettingsHooks() utility which returns ValidationIssues with rule IDs
  },
};
