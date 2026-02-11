/**
 * Rule: agent-name
 *
 * Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.name for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-name',
    name: 'Agent Name Format',
    description: 'Agent name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-name.md',
    docs: {
      recommended: true,
      summary: 'Validates that agent names follow the lowercase-with-hyphens naming convention.',
      details:
        'This rule enforces naming constraints on the name field in agent markdown frontmatter. The ' +
        'name must be lowercase with hyphens, under 64 characters, and must not contain XML tags. ' +
        'Validation is delegated to the AgentFrontmatterSchema.shape.name Zod schema. Consistent ' +
        'naming ensures agents are easily discoverable and avoids conflicts with reserved syntax.',
      examples: {
        incorrect: [
          {
            description: 'Agent name with uppercase letters',
            code: '---\nname: My-Agent\ndescription: Handles code reviews\n---',
            language: 'yaml',
          },
          {
            description: 'Agent name containing XML tags',
            code: '---\nname: <agent>helper</agent>\ndescription: Handles code reviews\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Agent name using lowercase and hyphens',
            code: '---\nname: code-review-agent\ndescription: Handles code reviews for pull requests\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Rename the agent to use only lowercase letters, digits, and hyphens. Ensure the name is ' +
        'under 64 characters and does not include any XML-style tags.',
      relatedRules: ['agent-description'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return;
    }

    const nameSchema = AgentFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
