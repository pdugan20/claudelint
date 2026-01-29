/**
 * Rule: agent-disallowed-tools
 *
 * Agent disallowed-tools must be an array of tool names
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-disallowed-tools',
    name: 'Agent Disallowed Tools Format',
    description: 'Agent disallowed-tools must be an array of tool names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-disallowed-tools.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using Array of strings
  },
};
