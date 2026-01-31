/**
 * Rule: agent-tools
 *
 * Agent tools must be an array of tool names, cannot be used with disallowed-tools
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterWithRefinements for cross-field validation
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  AgentFrontmatterSchema,
  AgentFrontmatterWithRefinements,
} from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-tools',
    name: 'Agent Tools Format',
    description: 'Agent tools must be an array of tool names, cannot be used with disallowed-tools',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-tools.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.tools) {
      return;
    }

    // First validate the array itself
    const toolsSchema = AgentFrontmatterSchema.shape.tools;
    const result = toolsSchema.safeParse(frontmatter.tools);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'tools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
      return;
    }

    // Then check cross-field validation (mutual exclusivity with disallowed-tools)
    const crossFieldResult = AgentFrontmatterWithRefinements.safeParse(frontmatter);

    if (!crossFieldResult.success) {
      const toolsError = crossFieldResult.error.issues.find((issue) =>
        issue.path.includes('tools')
      );

      if (toolsError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'tools');
        context.report({
          message: toolsError.message,
          line,
        });
      }
    }
  },
};
