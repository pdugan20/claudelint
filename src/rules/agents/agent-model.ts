/**
 * Rule: agent-model
 *
 * Agent model must be one of: sonnet, opus, haiku, inherit
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.model for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

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
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-model.md',
    docs: {
      recommended: true,
      summary: 'Validates that the agent model field is a recognized ' + 'model name.',
      details:
        'This rule enforces that the `model` field in agent ' +
        'markdown frontmatter is one of the allowed values: ' +
        '`sonnet`, `opus`, `haiku`, or `inherit`. Using an ' +
        'unrecognized model name will cause the agent framework ' +
        'to fail at initialization. Validation is delegated to ' +
        'the AgentFrontmatterSchema.shape.model Zod schema ' +
        'which uses the ModelNames enum. The `inherit` option ' +
        'tells the agent to use the parent conversation model.',
      examples: {
        incorrect: [
          {
            description: 'Invalid model name',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: gpt-4\n---',
          },
          {
            description: 'Model name with wrong casing',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: Sonnet\n---',
          },
        ],
        correct: [
          {
            description: 'Valid model name',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: sonnet\n---',
          },
          {
            description: 'Using inherit to match the parent model',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: inherit\n---',
          },
        ],
      },
      howToFix:
        'Set the `model` field to one of: `sonnet`, `opus`, ' +
        '`haiku`, or `inherit`. Model names are case-sensitive ' +
        'and must be lowercase.',
      relatedRules: ['agent-name', 'agent-description'],
    },
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
