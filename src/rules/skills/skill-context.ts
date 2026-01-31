/**
 * Rule: skill-context
 *
 * Skill context must be one of: fork, inline, auto
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.context for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

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
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-context.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.context) {
      return;
    }

    const contextSchema = SkillFrontmatterSchema.shape.context;
    const result = contextSchema.safeParse(frontmatter.context);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'context');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
