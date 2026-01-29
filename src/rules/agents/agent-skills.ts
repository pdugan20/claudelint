/**
 * Rule: agent-skills
 *
 * Agent skills must be an array of skill names
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-skills',
    name: 'Agent Skills Format',
    description: 'Agent skills must be an array of skill names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-skills.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using Array of strings
  },
};
