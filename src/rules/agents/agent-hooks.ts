/**
 * Rule: agent-hooks
 *
 * Agent hooks must be an object with event name keys
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.hooks for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-hooks',
    name: 'Agent Hooks Format',
    description: 'Agent hooks must be an object with event name keys',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-hooks.md',
    docs: {
      recommended: true,
      summary:
        'Validates that agent hooks are a properly formatted object ' + 'with event name keys.',
      rationale:
        'Malformed hook objects cause runtime errors when the agent framework tries to register event handlers.',
      details:
        'This rule enforces that the `hooks` field in agent markdown ' +
        'frontmatter is a valid object keyed by event names. The ' +
        'supported event names are PreToolUse, PostToolUse, ' +
        'PostToolUseFailure, PermissionRequest, UserPromptSubmit, ' +
        'Notification, Stop, SubagentStart, SubagentStop, PreCompact, ' +
        'SessionStart, SessionEnd, TeammateIdle, and TaskCompleted. ' +
        'Each key maps to an array of hook matchers. Validation is ' +
        'delegated to the AgentFrontmatterSchema.shape.hooks Zod ' +
        'schema. Correctly structured hooks allow the agent ' +
        'framework to register event handlers at runtime.',
      examples: {
        incorrect: [
          {
            description: 'Hooks defined as an array instead of an object',
            code:
              '---\nname: build-agent\n' +
              'description: Runs build pipelines\n' +
              'hooks:\n  - PreToolUse\n  - PostToolUse\n---',
          },
          {
            description: 'Hooks defined as a plain string',
            code:
              '---\nname: build-agent\n' +
              'description: Runs build pipelines\n' +
              'hooks: PreToolUse\n---',
          },
        ],
        correct: [
          {
            description: 'Hooks as an object with event name keys',
            code:
              '---\nname: build-agent\n' +
              'description: Runs build pipelines\n' +
              'hooks:\n  PreToolUse:\n' +
              '    - matcher: Bash\n' +
              '      command: echo "pre-check"\n---',
          },
        ],
      },
      howToFix:
        'Reformat the `hooks` field as an object where each key is ' +
        'a valid event name (PreToolUse, PostToolUse, etc.) and ' +
        'each value is an array of hook matcher objects.',
      relatedRules: ['agent-hooks-invalid-schema', 'hooks-invalid-event'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.hooks) {
      return;
    }

    const hooksSchema = AgentFrontmatterSchema.shape.hooks;
    const result = hooksSchema.safeParse(frontmatter.hooks);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'hooks');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
