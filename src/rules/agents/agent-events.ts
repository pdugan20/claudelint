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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-events.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterWithRefinements
    // Schema validates using Array of strings, max 3 items refinement
  },
};
