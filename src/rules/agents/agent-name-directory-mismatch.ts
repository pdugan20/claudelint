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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-name-directory-mismatch.md',
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
