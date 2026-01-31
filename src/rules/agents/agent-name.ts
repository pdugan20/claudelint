/**
 * Rule: agent-name
 *
 * Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.name for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-name',
    name: 'Agent Name Format',
    description: 'Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-name.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return;
    }

    const nameSchema = AgentFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
