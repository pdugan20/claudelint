/**
 * Rule: agent-missing-system-prompt
 *
 * Validates that agent includes a "System Prompt" section
 *
 * Agents should clearly document their system prompt or instructions
 * in a dedicated section for maintainability and clarity.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent, hasMarkdownSection } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-missing-system-prompt',
    name: 'Agent Missing System Prompt',
    description: 'Agent should include a "System Prompt" section',
    category: 'Agents',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-missing-system-prompt.md',
    docs: {
      recommended: true,
      summary: 'Validates that agent files include a "System Prompt" ' + 'markdown section.',
      rationale:
        'Without a structured system prompt section, the agent lacks clear behavioral instructions for consistent responses.',
      details:
        'This rule checks that AGENT.md files contain a heading ' +
        'matching "System Prompt" (case-insensitive, levels 1-3). ' +
        'A dedicated system prompt section provides clear, ' +
        'maintainable behavioral instructions for the agent. ' +
        'Without it, the agent may lack the structured guidance ' +
        'needed for consistent responses. The rule scans the body ' +
        'content (after frontmatter) using a regex pattern for ' +
        'headings like `# System Prompt`, `## System Prompt`, or ' +
        '`### System Prompt`.',
      examples: {
        incorrect: [
          {
            description: 'Agent file without a System Prompt section',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n---\n\n' +
              '## Instructions\n\n' +
              'Review all code changes carefully.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Agent file with a System Prompt section',
            code:
              '---\nname: code-review\n' +
              'description: Reviews code for quality\n---\n\n' +
              '## System Prompt\n\n' +
              'You are a code review agent. Analyze code changes ' +
              'for correctness, performance, and maintainability.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add a markdown heading titled "System Prompt" (at level ' +
        '1, 2, or 3) followed by the agent behavioral instructions. ' +
        'For example: `## System Prompt`.',
      whenNotToUse:
        'Disable this rule if your project uses a different ' +
        'convention for naming the agent instructions section.',
      relatedRules: ['agent-body-too-short', 'agent-name', 'agent-description'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate AGENT.md files
    if (!filePath.endsWith('AGENT.md')) {
      return;
    }

    const body = extractBodyContent(fileContent);
    const systemPromptRegex = /#{1,3}\s*system\s*prompt/i;

    if (!hasMarkdownSection(body, systemPromptRegex)) {
      context.report({
        message: 'Missing "System Prompt" section',
      });
    }
  },
};
