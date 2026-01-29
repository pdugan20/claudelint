/**
 * Rule: agent-name
 *
 * Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags
 *
 * This validation is implemented in AgentFrontmatterSchema which validates
 * the field using lowercaseHyphens(), max(64), noXMLTags().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-name',
    name: 'Agent Name Format',
    description: 'Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-name.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentFrontmatterSchema
    // Schema validates using lowercaseHyphens(), max(64), noXMLTags()
  },
};
