/**
 * Rule: agent-hooks
 *
 * Agent hooks must be an array of valid hook objects
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.hooks for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-hooks',
    name: 'Agent Hooks Format',
    description: 'Agent hooks must be an array of valid hook objects',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-hooks.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.hooks) {
      return;
    }

    const hooksSchema = AgentFrontmatterSchema.shape.hooks;
    const result = hooksSchema.safeParse(frontmatter.hooks);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'hooks');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
