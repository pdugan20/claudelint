/**
 * Rule: skill-context
 *
 * Skill context must be one of: fork, inline, auto
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using ContextModes enum.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-context',
    name: 'Skill Context Mode',
    description: 'Skill context must be one of: fork, inline, auto',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-context.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using ContextModes enum
  },
};
