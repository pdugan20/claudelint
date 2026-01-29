/**
 * Rule: skill-missing-version
 *
 * Warns when skill frontmatter lacks a version field. Version numbers help users
 * and Claude track skill updates and ensure compatibility.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/markdown';
import { SkillFrontmatter } from '../../schemas/skill-frontmatter.schema';

/**
 * Missing version validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-version',
    name: 'Skill Missing Version',
    description: 'Skill frontmatter lacks version field',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-version.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check for version field in frontmatter
    const { frontmatter } = extractFrontmatter<SkillFrontmatter>(fileContent);

    if (frontmatter && !frontmatter.version) {
      context.report({
        message: 'Skill frontmatter lacks "version" field',
        fix: 'Add "version: 1.0.0" to the SKILL.md frontmatter',
      });
    }
  },
};
