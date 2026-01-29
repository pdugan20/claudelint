/**
 * Rule: skill-disallowed-tools
 *
 * Skill disallowed-tools must be an array of tool names
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-disallowed-tools',
    name: 'Skill Disallowed Tools Format',
    description: 'Skill disallowed-tools must be an array of tool names',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-disallowed-tools.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using Array of strings
  },
};
