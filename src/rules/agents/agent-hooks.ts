/**
 * Rule: agent-hooks
 *
 * Agent hooks must be an array of valid hook objects
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using Array of HookSchema objects.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-hooks',
    name: 'Agent Hooks Format',
    description: 'Agent hooks must be an array of valid hook objects',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-hooks.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using Array of HookSchema objects
  },
};
