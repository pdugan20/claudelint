/**
 * Example custom rule that imports from claude-code-lint/utils.
 *
 * Demonstrates that the public utils barrel exports are usable
 * by custom rule authors. In real usage the import path would be
 * `claude-code-lint/utils`, but in tests we resolve to the source.
 */

import {
  hasHeading,
  extractHeadings,
  extractFrontmatter,
  matchesPattern,
  countOccurrences,
} from '../../../src/utils/index';

export const rule = {
  meta: {
    id: 'require-changelog-heading' as const,
    name: 'Require Changelog Heading',
    description: 'CLAUDE.md must contain a Changelog section with at least one entry',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
  },

  validate: async (context: {
    filePath: string;
    fileContent: string;
    options: Record<string, unknown>;
    report: (issue: { message: string; line?: number }) => void;
  }) => {
    const { fileContent } = context;

    // Use hasHeading from utils
    if (!hasHeading(fileContent, 'Changelog') && !hasHeading(fileContent, 'Change Log')) {
      context.report({
        message: 'Missing Changelog heading',
        line: 1,
      });
      return;
    }

    // Use extractFrontmatter from utils
    const fm = extractFrontmatter<{ version?: string }>(fileContent);
    if (fm.frontmatter?.version && !matchesPattern(fm.frontmatter.version, /^\d+\.\d+/)) {
      context.report({
        message: 'Invalid version in frontmatter',
        line: 1,
      });
    }

    // Use extractHeadings and countOccurrences from utils
    const headings = extractHeadings(fileContent);
    if (headings.length === 0) {
      context.report({
        message: 'No headings found in file',
        line: 1,
      });
    }

    // Use countOccurrences with a string search
    const todoCount = countOccurrences(fileContent, 'TODO');
    if (todoCount > 5) {
      context.report({
        message: `Too many TODO items (${todoCount})`,
        line: 1,
      });
    }
  },
};
