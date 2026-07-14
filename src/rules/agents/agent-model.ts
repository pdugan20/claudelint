/**
 * Rule: agent-model
 *
 * Agent model should be a known alias or valid full model ID
 *
 * Validates that the model field uses a recognized alias (sonnet, opus, haiku, inherit)
 * or a full Claude model ID pattern (e.g. claude-opus-4-6). Warns on unrecognized values.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

/**
 * Known model aliases
 *
 * docs-baseline/sub-agents.md:290 — "use one of the available aliases: `sonnet`,
 * `opus`, `haiku`, or `fable`". `inherit` is documented alongside them at :273.
 */
const MODEL_ALIASES = ['sonnet', 'opus', 'haiku', 'fable', 'inherit'];

/** Pattern for full Claude model IDs (e.g. claude-sonnet-4-5, claude-opus-4-6) */
const FULL_MODEL_ID_RE = /^claude-[a-z]+-[\d]+-[\d]+/;

export const rule: Rule = {
  meta: {
    id: 'agent-model',
    name: 'Agent Model Value',
    description: 'Agent model should be a known alias or valid model ID',
    category: 'Agents',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-model',
    docs: {
      recommended: true,
      summary: 'Validates that the agent model field is a recognized model name or ID.',
      rationale:
        'An unrecognized model name may cause the agent framework to fail at initialization.',
      details:
        'This rule checks that the `model` field in agent markdown frontmatter is either a known ' +
        'alias (`sonnet`, `opus`, `haiku`, `inherit`) or a full Claude model ID ' +
        '(e.g. `claude-opus-4-6`). The `inherit` option tells the agent to use the parent ' +
        'conversation model. Unrecognized values produce a warning since Claude Code accepts ' +
        'arbitrary model strings.',
      examples: {
        incorrect: [
          {
            description: 'Non-Claude model name',
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
            description: 'Valid model alias',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: sonnet\n---',
          },
          {
            description: 'Full model ID',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n' +
              'model: claude-opus-4-6\n---',
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
        'Set the `model` field to a known alias (`sonnet`, `opus`, `haiku`, `inherit`) ' +
        'or a full Claude model ID (e.g. `claude-opus-4-6`).',
      relatedRules: ['agent-name', 'agent-description'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || typeof frontmatter.model !== 'string') {
      return;
    }

    const model = frontmatter.model;

    if (MODEL_ALIASES.includes(model) || FULL_MODEL_ID_RE.test(model)) {
      return;
    }

    const line = getFrontmatterFieldLine(context.fileContent, 'model');
    context.report({
      message: `Unrecognized model: "${model}"`,
      line,
    });
  },
};
