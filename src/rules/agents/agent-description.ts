/**
 * Rule: agent-description
 *
 * Agent description must be at least 10 characters, written in third person, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.description for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-description',
    name: 'Agent Description Format',
    description:
      'Agent description must be at least 10 characters, written in third person, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-description.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.description) {
      return;
    }

    const descriptionSchema = AgentFrontmatterSchema.shape.description;
    const result = descriptionSchema.safeParse(frontmatter.description);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
