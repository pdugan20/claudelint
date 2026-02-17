/**
 * Rule: agent-events
 *
 * Agent events must be an array with maximum 3 event names
 *
 * This validation is implemented in AgentFrontmatterWithRefinements which validates
 * the field using Array of strings, max 3 items refinement.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-events',
    name: 'Agent Events Format',
    description: 'Agent events must be an array with maximum 3 event names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-events',
    docs: {
      recommended: true,
      summary: 'Enforces that agent events are an array with at most 3 entries.',
      rationale:
        'Too many event subscriptions create noisy agents; capping at 3 keeps agents focused.',
      details:
        'This rule validates the `events` field in agent frontmatter. Events must be an array ' +
        'of strings with a maximum of 3 items. This constraint keeps agents focused on a small ' +
        'set of triggers rather than responding to every possible event. The validation is ' +
        'enforced via the AgentFrontmatterWithRefinements schema.',
      examples: {
        incorrect: [
          {
            description: 'Agent with too many events',
            code: '---\nname: my-agent\ndescription: Monitors everything\nevents:\n  - PreToolUse\n  - PostToolUse\n  - Stop\n  - SessionStart\n---',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Agent with a focused set of events',
            code: '---\nname: my-agent\ndescription: Validates tool usage\nevents:\n  - PreToolUse\n  - PostToolUse\n---',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Reduce the `events` array to at most 3 entries. If you need to respond to more events, ' +
        'consider splitting the logic across multiple focused agents.',
      relatedRules: ['agent-hooks', 'agent-description'],
    },
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterWithRefinements
    // Schema validates using Array of strings, max 3 items refinement
  },
};
