/**
 * Rule: skill-dependencies
 *
 * Skill dependencies must be an array of strings
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-dependencies',
    name: 'Skill Dependencies Format',
    description: 'Skill dependencies must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-dependencies.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using Array of strings
  },
};
