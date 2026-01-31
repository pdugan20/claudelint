/**
 * Rule: skill-tags
 *
 * Skill tags must be an array of strings
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.tags for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-tags',
    name: 'Skill Tags Format',
    description: 'Skill tags must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-tags.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.tags) {
      return;
    }

    const tagsSchema = SkillFrontmatterSchema.shape.tags;
    const result = tagsSchema.safeParse(frontmatter.tags);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'tags');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
