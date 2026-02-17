/**
 * Custom rule: require-skill-see-also
 *
 * Ensures every SKILL.md file has a ## See Also section for cross-referencing.
 * Demonstrates: Skills category, basic rule structure, hasHeading helper.
 */

import type { Rule } from '../../src/types/rule';
import { hasHeading } from '../../src/utils/rules/helpers';

export const rule: Rule = {
  meta: {
    id: 'require-skill-see-also',
    name: 'Require Skill See Also',
    description: 'SKILL.md must have a ## See Also section for cross-referencing related skills',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('SKILL.md')) {
      return;
    }

    if (!hasHeading(context.fileContent, 'See Also', 2)) {
      context.report({
        message: 'Missing ## See Also section',
        line: 1,
        fix: 'Add a ## See Also section linking to related skills',
      });
    }
  },
};
