/**
 * Rule: agent-description
 *
 * Agent description must be at least 10 characters
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
    description: 'Agent description must be at least 10 characters',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-description.md',
    docs: {
      recommended: true,
      summary: 'Validates that agent descriptions meet minimum length requirements.',
      rationale:
        'Short descriptions make it hard for users to understand agent purpose when browsing.',
      details:
        'This rule enforces a minimum length on the description field in agent markdown frontmatter. The ' +
        'description must be at least 10 characters. Validation is delegated to the ' +
        'AgentFrontmatterSchema.shape.description Zod schema. Agent descriptions may include XML-style ' +
        'tags like `<example>` and `<commentary>` which are conventional for trigger matching.',
      examples: {
        incorrect: [
          {
            description: 'Agent description that is too short',
            code: '---\nname: code-review\ndescription: Reviews\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Descriptive agent description',
            code: '---\nname: code-review\ndescription: Handles code reviews for pull requests and suggests improvements\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Write a description of at least 10 characters that clearly explains what the agent does ' +
        'and when it should be triggered.',
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
