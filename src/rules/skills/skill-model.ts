/**
 * Rule: skill-model
 *
 * Skill model must be one of: sonnet, opus, haiku, inherit
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.model for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

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
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-model.md',
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.model) {
      return; // Field not present - model is optional
    }

    // Delegate to Zod schema validator for 'model' field
    const modelSchema = SkillFrontmatterSchema.shape.model;
    const result = modelSchema.safeParse(frontmatter.model);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'model');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
