/**
 * Rule: agent-description
 *
 * Agent description must be at least 10 characters, written in third person, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.description for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-description',
    name: 'Agent Description Format',
    description:
      'Agent description must be at least 10 characters, written in third person, with no XML tags',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-description.md',
    docs: {
      recommended: true,
      summary: 'Validates that agent descriptions meet minimum length and formatting requirements.',
      details:
        'This rule enforces constraints on the description field in agent markdown frontmatter. The ' +
        'description must be at least 10 characters, written in third person, and must not contain XML ' +
        'tags. Validation is delegated to the AgentFrontmatterSchema.shape.description Zod schema. A ' +
        'clear description helps users understand the agent purpose when browsing available agents.',
      examples: {
        incorrect: [
          {
            description: 'Agent description that is too short',
            code: '---\nname: code-review\ndescription: Reviews\n---',
            language: 'yaml',
          },
          {
            description: 'Agent description with XML tags',
            code: '---\nname: code-review\ndescription: <b>Handles</b> code reviews for pull requests\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Descriptive third-person agent description',
            code: '---\nname: code-review\ndescription: Handles code reviews for pull requests and suggests improvements\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Write a description of at least 10 characters in third person. Remove any XML tags and ' +
        'ensure the text clearly explains what the agent does.',
      relatedRules: ['agent-name'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.description) {
      return;
    }

    const descriptionSchema = AgentFrontmatterSchema.shape.description;
    const result = descriptionSchema.safeParse(frontmatter.description);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
