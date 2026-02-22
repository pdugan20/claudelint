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
import { extractBodyContent } from '../../utils/formats/markdown';
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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-body-too-short',
    schema: z.object({
      minLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLength: 50,
    },
    docs: {
      recommended: true,
      summary: 'Validates that agent body content meets a minimum length threshold.',
      rationale:
        'Sparse agent definitions lack the detailed instructions needed for consistent, high-quality responses.',
      details:
        'This rule checks that the markdown body of an agent file ' +
        '(the content after frontmatter) contains enough substantive ' +
        'text. Very short body content typically indicates an incomplete ' +
        'agent definition that lacks the detailed instructions needed ' +
        'for effective agent behavior. The minimum length is ' +
        'configurable via the `minLength` option.',
      examples: {
        incorrect: [
          {
            description: 'Agent body that is too short',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n---\n\n' +
              'Review code.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Agent body with sufficient instructions',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n---\n\n' +
              '## System Prompt\n\n' +
              'You are a code review agent. Analyze pull requests ' +
              'for correctness, performance, and style issues. ' +
              'Provide actionable feedback with specific suggestions.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add more detailed instructions, guidelines, or context to ' +
        'the agent body content. Include a System Prompt section ' +
        'with clear behavioral directives.',
      optionExamples: [
        {
          description: 'Require at least 100 characters of body content',
          config: { 'agent-body-too-short': ['warn', { minLength: 100 }] },
        },
        {
          description: 'Use a lower threshold for simple agents',
          config: { 'agent-body-too-short': ['warn', { minLength: 30 }] },
        },
      ],
      whenNotToUse:
        'Disable this rule if your agents use an external system ' +
        'prompt source and the agent file body is intentionally minimal.',
      relatedRules: ['agent-name', 'agent-description'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate agent .md files
    if (!filePath.endsWith('.md')) {
      return;
    }

    const ruleOptions = options as AgentBodyTooShortOptions;
    const minLength = ruleOptions?.minLength ?? 50;

    const body = extractBodyContent(fileContent);

    if (body.length < minLength) {
      context.report({
        message: `Body too short (${body.length}/${minLength} characters)`,
      });
    }
  },
};
