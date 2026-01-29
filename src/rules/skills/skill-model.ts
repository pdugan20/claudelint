/**
 * Rule: skill-model
 *
 * Skill model must be one of: sonnet, opus, haiku, inherit
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using ModelNames enum.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-model',
    name: 'Skill Model Value',
    description: 'Skill model must be one of: sonnet, opus, haiku, inherit',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-model.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using ModelNames enum
  },
};
