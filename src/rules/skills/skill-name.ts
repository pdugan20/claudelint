/**
 * Rule: skill-name
 *
 * Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using lowercaseHyphens(), max(64), noXMLTags(), noReservedWords().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description: 'Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-name.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using lowercaseHyphens(), max(64), noXMLTags(), noReservedWords()
  },
};
