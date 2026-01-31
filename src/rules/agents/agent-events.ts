/**
 * Rule: agent-events
 *
 * Agent events must be an array of event names (max 3 items)
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterWithRefinements for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import {
  AgentFrontmatterSchema,
  AgentFrontmatterWithRefinements,
} from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-events',
    name: 'Agent Events Format',
    description: 'Agent events must be an array of event names (max 3 items)',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-events.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.events) {
      return;
    }

    // First validate the array itself
    const eventsSchema = AgentFrontmatterSchema.shape.events;
    const result = eventsSchema.safeParse(frontmatter.events);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'events');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
      return;
    }

    // Then check cross-field validation (max 3 items)
    const crossFieldResult = AgentFrontmatterWithRefinements.safeParse(frontmatter);

    if (!crossFieldResult.success) {
      const eventsError = crossFieldResult.error.issues.find((issue) =>
        issue.path.includes('events')
      );

      if (eventsError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'events');
        context.report({
          message: eventsError.message,
          line,
        });
      }
    }
  },
};
