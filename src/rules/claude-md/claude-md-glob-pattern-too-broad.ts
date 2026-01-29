/**
 * Rule: claude-md-glob-pattern-too-broad
 *
 * Warns when path patterns in frontmatter are overly broad (** or *).
 * Broad patterns may match unintended files and should be more specific.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/markdown';

/**
 * Glob pattern too broad validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-glob-pattern-too-broad',
    name: 'Glob Pattern Too Broad',
    description: 'Path pattern is overly broad',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-glob-pattern-too-broad.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check files in .claude/rules/ directory (rules files with frontmatter)
    if (!filePath.includes('.claude/rules/')) {
      return;
    }

    // Parse frontmatter
    const { frontmatter } = extractFrontmatter(fileContent);
    if (!frontmatter) {
      return;
    }

    // Check paths field for overly broad patterns
    if (Array.isArray(frontmatter.paths)) {
      for (const pattern of frontmatter.paths) {
        if (pattern === '**' || pattern === '*') {
          context.report({
            message: `Path pattern is very broad: ${pattern}. Consider being more specific.`,
          });
        }
      }
    }
  },
};
