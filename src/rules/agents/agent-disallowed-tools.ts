/**
 * Rule: agent-disallowed-tools
 *
 * Agent disallowedTools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-disallowed-tools',
    name: 'Agent Disallowed Tools Format',
    description: 'Agent disallowedTools must be an array of tool names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-disallowed-tools.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.disallowedTools) {
      return;
    }

    const disallowedToolsSchema = AgentFrontmatterSchema.shape.disallowedTools;
    const result = disallowedToolsSchema.safeParse(frontmatter.disallowedTools);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'disallowedTools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
