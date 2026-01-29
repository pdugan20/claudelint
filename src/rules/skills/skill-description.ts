/**
 * Rule: skill-description
 *
 * Skill description must be at least 10 characters, written in third person, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.description for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

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
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.description) {
      return; // Field not present - let other rules handle missing fields
    }

    // Delegate to Zod schema validator for 'description' field
    const descriptionSchema = SkillFrontmatterSchema.shape.description;
    const result = descriptionSchema.safeParse(frontmatter.description);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
