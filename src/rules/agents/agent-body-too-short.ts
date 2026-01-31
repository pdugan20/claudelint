/**
 * Rule: agent-body-too-short
 *
 * Validates that agent body content meets minimum length requirements
 *
 * Agents should include substantive instructions beyond frontmatter.
 * Very short body content suggests incomplete documentation.
 *
 * Options:
 * - minLength: Minimum body content length (default: 50)
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/markdown';
import { z } from 'zod';

/**
 * Options for agent-body-too-short rule
 */
export interface AgentBodyTooShortOptions {
  /** Minimum body content length in characters (default: 50) */
  minLength?: number;
}

export const rule: Rule = {
  meta: {
    id: 'agent-body-too-short',
    name: 'Agent Body Too Short',
    description: 'Agent body content should meet minimum length requirements',
    category: 'Agents',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-body-too-short.md',
    schema: z.object({
      minLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLength: 50,
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate AGENT.md files
    if (!filePath.endsWith('AGENT.md')) {
      return;
    }

    const ruleOptions = options as AgentBodyTooShortOptions;
    const minLength = ruleOptions?.minLength ?? 50;

    const body = extractBodyContent(fileContent);

    if (body.length < minLength) {
      context.report({
        message: `Agent body content is very short (${body.length} characters). Consider adding more detailed instructions. (minimum: ${minLength})`,
      });
    }
  },
};
