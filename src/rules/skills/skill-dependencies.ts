/**
 * Rule: skill-dependencies
 *
 * Skill dependencies must be an array of strings
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.dependencies for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-dependencies',
    name: 'Skill Dependencies Format',
    description: 'Skill dependencies must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-dependencies.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.dependencies) {
      return;
    }

    const dependenciesSchema = SkillFrontmatterSchema.shape.dependencies;
    const result = dependenciesSchema.safeParse(frontmatter.dependencies);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'dependencies');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
