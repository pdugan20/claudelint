/**
 * Example team-specific custom rule
 * Enforces team naming conventions
 */

import type { Rule } from '../../../src/types/rule';

export const rule: Rule = {
  meta: {
    id: 'team-naming-convention',
    name: 'Team Naming Convention',
    description: 'Enforce team-specific naming conventions for skills',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Only run on SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check if skill name follows team convention: team-<name>
    const nameMatch = fileContent.match(/^name:\s*(.+)$/m);
    if (nameMatch) {
      const skillName = nameMatch[1].trim();
      if (!skillName.startsWith('team-')) {
        context.report({
          message: 'Skill name must start with "team-" prefix',
          line: 1,
          fix: 'Rename skill to follow team convention: team-<name>',
        });
      }
    }
  },
};
