/**
 * Rule: claude-md-glob-pattern-backslash
 *
 * Warns when path patterns in frontmatter use backslashes instead of forward slashes.
 * Path patterns should always use forward slashes, even on Windows.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

/**
 * Glob pattern backslash validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-glob-pattern-backslash',
    name: 'Glob Pattern Backslash',
    description: 'Path pattern uses backslashes instead of forward slashes',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-glob-pattern-backslash.md',
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

    // Check paths field for backslashes
    if (Array.isArray(frontmatter.paths)) {
      for (const pattern of frontmatter.paths) {
        if (typeof pattern === 'string' && pattern.includes('\\')) {
          context.report({
            message: `Path pattern uses backslashes: ${pattern}. Use forward slashes even on Windows.`,
          });
        }
      }
    }
  },
};
