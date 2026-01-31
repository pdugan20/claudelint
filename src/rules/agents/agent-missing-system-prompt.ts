/**
 * Rule: agent-missing-system-prompt
 *
 * Validates that agent includes a "System Prompt" section
 *
 * Agents should clearly document their system prompt or instructions
 * in a dedicated section for maintainability and clarity.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent, hasMarkdownSection } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-missing-system-prompt',
    name: 'Agent Missing System Prompt',
    description: 'Agent should include a "System Prompt" section',
    category: 'Agents',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-missing-system-prompt.md',
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
        message: 'Agent should include a "System Prompt" section with detailed instructions.',
      });
    }
  },
};
