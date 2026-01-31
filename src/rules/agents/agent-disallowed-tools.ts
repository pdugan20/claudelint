/**
 * Rule: agent-disallowed-tools
 *
 * Agent disallowed-tools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-disallowed-tools',
    name: 'Agent Disallowed Tools Format',
    description: 'Agent disallowed-tools must be an array of tool names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-disallowed-tools.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter['disallowed-tools']) {
      return;
    }

    const disallowedToolsSchema = AgentFrontmatterSchema.shape['disallowed-tools'];
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
