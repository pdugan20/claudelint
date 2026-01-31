/**
 * Rule: agent-skills
 *
 * Agent skills must be an array of skill names
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.skills for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-skills',
    name: 'Agent Skills Format',
    description: 'Agent skills must be an array of skill names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-skills.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.skills) {
      return;
    }

    const skillsSchema = AgentFrontmatterSchema.shape.skills;
    const result = skillsSchema.safeParse(frontmatter.skills);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'skills');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
