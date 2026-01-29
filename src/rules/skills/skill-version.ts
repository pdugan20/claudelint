/**
 * Rule: skill-version
 *
 * Skill version must follow semantic versioning format (e.g., 1.0.0)
 *
 * This validation is implemented in SkillFrontmatterSchema which validates
 * the field using semver() refinement.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-version',
    name: 'Skill Version Format',
    description: 'Skill version must follow semantic versioning format (e.g., 1.0.0)',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-version.md',
  },
  validate: () => {
    // No-op: Validation implemented in SkillFrontmatterSchema
    // Schema validates using semver() refinement
  },
};
