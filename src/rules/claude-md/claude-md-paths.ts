/**
 * Rule: claude-md-paths
 *
 * Claude MD paths must be a non-empty array with at least one path pattern.
 * This rule only validates .claude/rules/*.md files which require frontmatter.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'claude-md-paths',
    name: 'Claude MD Paths Format',
    description: 'Claude MD paths must be a non-empty array with at least one path pattern',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-paths.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate .claude/rules/*.md files
    if (!filePath.includes('.claude/rules/')) {
      return;
    }

    // Parse frontmatter
    const { frontmatter } = extractFrontmatter<{ paths?: unknown }>(fileContent);
    if (!frontmatter) {
      return; // No frontmatter or parse errors handled elsewhere
    }

    // Check if paths field exists
    if (!frontmatter.paths) {
      return; // Missing paths is optional in some cases
    }

    // Validate paths is a non-empty array
    if (!Array.isArray(frontmatter.paths)) {
      context.report({
        message: 'Paths field must be an array',
      });
      return;
    }

    if (frontmatter.paths.length === 0) {
      context.report({
        message: 'Paths array must contain at least one path pattern',
      });
      return;
    }

    // Validate each path is a non-empty string
    for (const [index, path] of frontmatter.paths.entries()) {
      if (typeof path !== 'string') {
        context.report({
          message: `Path at index ${index} must be a string`,
        });
      } else if (path.trim().length === 0) {
        context.report({
          message: `Path at index ${index} cannot be empty`,
        });
      }
    }
  },
};
