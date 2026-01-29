/**
 * Rule: skill-tags
 *
 * Skill tags must be an array of strings
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-tags',
    name: 'Skill Tags Format',
    description: 'Skill tags must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-tags.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using Array of strings
  },
};
