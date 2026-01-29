/**
 * Rule: skill-agent
 *
 * When skill context is "fork", agent field is required to specify which agent to use
 *
 * This validation is implemented in SkillFrontmatterWithRefinements which validates
 * the field using Cross-field refinement: requires agent when context=fork.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-agent',
    name: 'Skill Agent Requirement',
    description: 'When skill context is "fork", agent field is required to specify which agent to use',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-agent.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterWithRefinements
    // Schema validates using Cross-field refinement: requires agent when context=fork
  },
};
