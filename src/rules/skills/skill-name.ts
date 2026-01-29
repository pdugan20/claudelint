/**
 * Rule: skill-name
 *
 * Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.name for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

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
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return; // Field not present - let other rules handle missing fields
    }

    // Delegate to Zod schema validator for 'name' field
    const nameSchema = SkillFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
