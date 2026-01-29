/**
 * Rule: agent-tools
 *
 * Agent tools must be an array of tool names, cannot be used with disallowed-tools
 *
 * This validation is implemented in AgentFrontmatterWithRefinements which validates
 * the field using Array of strings, mutex refinement with disallowed-tools.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-tools',
    name: 'Agent Tools Format',
    description: 'Agent tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-tools.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterWithRefinements
    // Schema validates using Array of strings, mutex refinement with disallowed-tools
  },
};
