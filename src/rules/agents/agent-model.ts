/**
 * Rule: agent-model
 *
 * Agent model must be one of: sonnet, opus, haiku, inherit
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.model for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-model',
    name: 'Agent Model Value',
    description: 'Agent model must be one of: sonnet, opus, haiku, inherit',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-model.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.model) {
      return;
    }

    const modelSchema = AgentFrontmatterSchema.shape.model;
    const result = modelSchema.safeParse(frontmatter.model);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'model');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
