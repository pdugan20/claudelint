/**
 * Rule: agent-disallowed-tools
 *
 * Agent disallowedTools must be an array of tool names
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-disallowed-tools',
    name: 'Agent Disallowed Tools Format',
    description: 'Agent disallowedTools must be an array of tool names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-disallowed-tools',
    docs: {
      recommended: true,
      summary:
        'Validates that agent disallowedTools is a properly formatted ' +
        'array of tool name strings.',
      rationale:
        'A malformed disallowedTools field causes runtime errors when the agent framework parses tool restrictions.',
      details:
        'This rule enforces that the `disallowedTools` field in agent ' +
        'markdown frontmatter is a valid array of strings. Each entry ' +
        'should be a tool name that the agent is prohibited from using. ' +
        'Validation is delegated to the AgentFrontmatterSchema Zod ' +
        'schema. Proper formatting prevents runtime errors when the ' +
        'agent framework parses tool restrictions.',
      examples: {
        incorrect: [
          {
            description: 'disallowedTools as a single string instead of array',
            code:
              '---\nname: safe-agent\n' +
              'description: Agent with tool restrictions\n' +
              'disallowedTools: Bash\n---',
          },
          {
            description: 'disallowedTools with non-string entries',
            code:
              '---\nname: safe-agent\n' +
              'description: Agent with tool restrictions\n' +
              'disallowedTools:\n  - 123\n  - true\n---',
          },
        ],
        correct: [
          {
            description: 'disallowedTools as a valid array of tool names',
            code:
              '---\nname: safe-agent\n' +
              'description: Agent with tool restrictions\n' +
              'disallowedTools:\n  - Bash\n  - Write\n---',
          },
        ],
      },
      howToFix:
        'Ensure `disallowedTools` is formatted as a YAML array of ' +
        'strings. Each entry should be a valid tool name like Bash, ' +
        'Write, Edit, or WebFetch.',
      relatedRules: ['agent-tools'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.disallowedTools) {
      return;
    }

    const disallowedToolsSchema = AgentFrontmatterSchema.shape.disallowedTools;
    const result = disallowedToolsSchema.safeParse(frontmatter.disallowedTools);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'disallowedTools');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
