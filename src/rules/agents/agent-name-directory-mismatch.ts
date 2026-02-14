/**
 * Rule: agent-name-directory-mismatch
 *
 * Validates that agent name in frontmatter matches parent directory name
 *
 * The agent name must match the directory name for proper organization and discovery.
 * This ensures consistency between file structure and agent configuration.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { getParentDirectoryName } from '../../utils/filesystem/paths';
import { isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'agent-name-directory-mismatch',
    name: 'Agent Name Directory Mismatch',
    description: 'Agent name must match parent directory name',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-name-directory-mismatch.md',
    docs: {
      recommended: true,
      summary:
        'Validates that the agent name in frontmatter matches its ' + 'parent directory name.',
      rationale:
        'A name/directory mismatch prevents agent discovery, causing the agent to not appear when invoked by name.',
      details:
        'This rule checks that the `name` field in AGENT.md ' +
        'frontmatter exactly matches the name of the directory ' +
        'containing the file. For example, an agent at ' +
        '`.claude/agents/code-review/AGENT.md` must have ' +
        '`name: code-review` in its frontmatter. This consistency ' +
        'ensures agents are discoverable by directory traversal ' +
        'and prevents confusion when the file system and ' +
        'configuration disagree about an agent identity.',
      examples: {
        incorrect: [
          {
            description:
              'Agent name does not match directory ' +
              '(file at .claude/agents/code-review/AGENT.md)',
            code: '---\nname: review-agent\n' + 'description: Reviews code for quality\n---',
          },
        ],
        correct: [
          {
            description:
              'Agent name matches directory ' + '(file at .claude/agents/code-review/AGENT.md)',
            code: '---\nname: code-review\n' + 'description: Reviews code for quality\n---',
          },
        ],
      },
      howToFix:
        'Either rename the parent directory to match the agent ' +
        'name, or update the `name` field in frontmatter to ' +
        'match the parent directory name.',
      relatedRules: ['agent-name'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate AGENT.md files
    if (!filePath.endsWith('AGENT.md')) {
      return;
    }

    const { frontmatter } = extractFrontmatter(fileContent);

    if (!frontmatter || !frontmatter.name || !isString(frontmatter.name)) {
      return; // Missing name handled by agent-name rule
    }

    const dirName = getParentDirectoryName(filePath);

    if (frontmatter.name !== dirName) {
      context.report({
        message: `Agent name "${frontmatter.name}" does not match directory name "${dirName}"`,
      });
    }
  },
};
