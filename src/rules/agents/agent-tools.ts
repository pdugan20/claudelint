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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-tools',
    docs: {
      recommended: true,
      summary:
        'Validates that agent tools is a properly formatted array ' +
        'and is not used alongside disallowedTools.',
      rationale:
        'Using both tools and disallowedTools creates contradictory restrictions; a malformed array causes runtime errors.',
      details:
        'This rule enforces two constraints on the `tools` field ' +
        'in agent markdown frontmatter. First, `tools` must be a ' +
        'valid array of strings representing tool names the agent ' +
        'is allowed to use. Second, `tools` and `disallowedTools` ' +
        'are mutually exclusive -- specifying both is an error. ' +
        'Array validation is delegated to ' +
        'AgentFrontmatterSchema.shape.tools, while cross-field ' +
        'validation uses AgentFrontmatterWithRefinements. This ' +
        'prevents conflicting tool access configurations.',
      examples: {
        incorrect: [
          {
            description: 'Tools as a single string instead of array',
            code:
              '---\nname: code-agent\n' +
              'description: Writes and edits code\n' +
              'tools: Bash\n---',
          },
          {
            description: 'Both tools and disallowedTools specified',
            code:
              '---\nname: code-agent\n' +
              'description: Writes and edits code\n' +
              'tools:\n  - Bash\n  - Edit\n' +
              'disallowedTools:\n  - Write\n---',
          },
        ],
        correct: [
          {
            description: 'Tools as a valid array of tool names',
            code:
              '---\nname: code-agent\n' +
              'description: Writes and edits code\n' +
              'tools:\n  - Bash\n  - Edit\n  - Read\n---',
          },
          {
            description: 'Using disallowedTools alone (without tools)',
            code:
              '---\nname: safe-agent\n' +
              'description: Agent with restricted access\n' +
              'disallowedTools:\n  - Bash\n---',
          },
        ],
      },
      howToFix:
        'Ensure `tools` is a YAML array of strings. If you need ' +
        'to restrict certain tools, use either `tools` (allowlist) ' +
        'or `disallowedTools` (blocklist), but not both.',
      relatedRules: ['agent-disallowed-tools'],
    },
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
