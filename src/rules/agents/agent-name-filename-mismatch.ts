/**
 * Rule: agent-name-filename-mismatch
 *
 * Validates that agent name in frontmatter matches the filename.
 *
 * Agent files are flat .md files named after the agent (e.g., code-reviewer.md).
 * The frontmatter `name` field must match the filename (without .md extension).
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { isString } from '../../utils/type-guards';
import { basename } from 'path';

export const rule: Rule = {
  meta: {
    id: 'agent-name-filename-mismatch',
    name: 'Agent Name Filename Mismatch',
    description: 'Agent name must match filename',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-name-filename-mismatch',
    docs: {
      recommended: true,
      summary: 'Validates that the agent name in frontmatter matches the filename.',
      rationale:
        'A name/filename mismatch prevents agent discovery, causing the agent to not appear when invoked by name.',
      details:
        'This rule checks that the `name` field in agent frontmatter ' +
        'exactly matches the filename (without the `.md` extension). ' +
        'For example, an agent at `.claude/agents/code-reviewer.md` ' +
        'must have `name: code-reviewer` in its frontmatter. This ' +
        'consistency ensures agents are discoverable and prevents ' +
        'confusion when the filename and configuration disagree ' +
        'about the agent identity.',
      examples: {
        incorrect: [
          {
            description:
              'Agent name does not match filename ' + '(file at .claude/agents/code-reviewer.md)',
            code: '---\nname: review-agent\n' + 'description: Reviews code for quality\n---',
          },
        ],
        correct: [
          {
            description:
              'Agent name matches filename ' + '(file at .claude/agents/code-reviewer.md)',
            code: '---\nname: code-reviewer\n' + 'description: Reviews code for quality\n---',
          },
        ],
      },
      howToFix:
        'Either rename the file to match the agent name, or update ' +
        'the `name` field in frontmatter to match the filename ' +
        '(without the `.md` extension).',
      relatedRules: ['agent-name'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate .md files in agents directories
    if (!filePath.endsWith('.md') || !filePath.includes('agents/')) {
      return;
    }

    const { frontmatter } = extractFrontmatter(fileContent);

    if (!frontmatter || !frontmatter.name || !isString(frontmatter.name)) {
      return; // Missing name handled by agent-name rule
    }

    const fileName = basename(filePath, '.md');

    if (frontmatter.name !== fileName) {
      context.report({
        message: `Agent name "${frontmatter.name}" does not match filename "${fileName}"`,
      });
    }
  },
};
