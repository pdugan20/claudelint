/**
 * Rule: agent-model
 *
 * Agent model must be one of: sonnet, opus, haiku, inherit
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using ModelNames enum.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-model',
    name: 'Agent Model Value',
    description: 'Agent model must be one of: sonnet, opus, haiku, inherit',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-model.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using ModelNames enum
  },
};
