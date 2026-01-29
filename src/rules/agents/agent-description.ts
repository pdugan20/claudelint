/**
 * Rule: agent-description
 *
 * Agent description must be at least 10 characters, written in third person, with no XML tags
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using min(10), noXMLTags(), thirdPerson().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-description',
    name: 'Agent Description Format',
    description: 'Agent description must be at least 10 characters, written in third person, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-description.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using min(10), noXMLTags(), thirdPerson()
  },
};
