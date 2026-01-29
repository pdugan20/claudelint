/**
 * Rule: skill-description
 *
 * Skill description must be at least 10 characters, written in third person, with no XML tags
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using min(10), noXMLTags(), thirdPerson().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-description',
    name: 'Skill Description Format',
    description: 'Skill description must be at least 10 characters, written in third person, with no XML tags',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-description.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using min(10), noXMLTags(), thirdPerson()
  },
};
