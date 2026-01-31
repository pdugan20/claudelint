/**
 * Rule: skill-agent
 *
 * When skill context is "fork", agent field is required to specify which agent to use
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterWithRefinements for cross-field validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterWithRefinements } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-agent',
    name: 'Skill Agent Requirement',
    description:
      'When skill context is "fork", agent field is required to specify which agent to use',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-agent.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter) {
      return;
    }

    // Use SkillFrontmatterWithRefinements for cross-field validation
    const result = SkillFrontmatterWithRefinements.safeParse(frontmatter);

    if (!result.success) {
      // Find agent-related errors
      const agentError = result.error.issues.find((issue) => issue.path.includes('agent'));

      if (agentError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'agent');
        context.report({
          message: agentError.message,
          line,
        });
      }
    }
  },
};
