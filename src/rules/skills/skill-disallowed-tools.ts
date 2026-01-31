/**
 * Rule: skill-disallowed-tools
 *
 * Skill disallowed-tools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-disallowed-tools',
    name: 'Skill Disallowed Tools Format',
    description: 'Skill disallowed-tools must be an array of tool names',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-disallowed-tools.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['disallowed-tools']) {
      return;
    }

    const disallowedToolsSchema = SkillFrontmatterSchema.shape['disallowed-tools'];
    const result = disallowedToolsSchema.safeParse(frontmatter['disallowed-tools']);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'disallowed-tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
