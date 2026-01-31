/**
 * Rule: skill-allowed-tools
 *
 * Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterWithRefinements for cross-field validation
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  SkillFrontmatterSchema,
  SkillFrontmatterWithRefinements,
} from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-allowed-tools',
    name: 'Skill Allowed Tools Format',
    description:
      'Skill allowed-tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-allowed-tools.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['allowed-tools']) {
      return;
    }

    // First validate the array itself
    const allowedToolsSchema = SkillFrontmatterSchema.shape['allowed-tools'];
    const result = allowedToolsSchema.safeParse(frontmatter['allowed-tools']);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
      return;
    }

    // Then check cross-field validation (mutual exclusivity with disallowed-tools)
    const crossFieldResult = SkillFrontmatterWithRefinements.safeParse(frontmatter);

    if (!crossFieldResult.success) {
      const allowedToolsError = crossFieldResult.error.issues.find((issue) =>
        issue.path.includes('allowed-tools')
      );

      if (allowedToolsError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'allowed-tools');
        context.report({
          message: allowedToolsError.message,
          line,
        });
      }
    }
  },
};
