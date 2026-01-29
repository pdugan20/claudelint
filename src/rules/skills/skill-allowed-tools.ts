/**
 * Rule: skill-allowed-tools
 *
 * Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools
 *
 * This validation is implemented in SkillFrontmatterWithRefinements which validates
 * the field using Array of strings, mutex refinement with disallowed-tools.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description: 'Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-allowed-tools.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterWithRefinements
    // Schema validates using Array of strings, mutex refinement with disallowed-tools
  },
};
