/**
 * Example custom rule: no-absolute-paths
 *
 * Detects absolute file paths in documentation files, which can break
 * when shared across different systems or users.
 *
 * Demonstrates: matchesPattern, findLinesMatching helpers
 */

const { matchesPattern, findLinesMatching } = require('claudelint/utils');

module.exports.rule = {
  meta: {
    id: 'no-absolute-paths',
    name: 'No Absolute Paths',
    description: 'Disallow absolute file paths in documentation',
    category: 'Custom',
    severity: 'warning',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    // Only check markdown files
    if (!context.filePath.endsWith('.md')) {
      return;
    }

    // Pattern for common absolute paths
    const absolutePathPattern = /(?:\/Users\/|\/home\/|C:\\|D:\\|\/mnt\/)/gi;

    // Quick check if any matches exist
    if (!matchesPattern(context.fileContent, absolutePathPattern)) {
      return; // No violations
    }

    // Find all lines with absolute paths
    const matches = findLinesMatching(context.fileContent, absolutePathPattern);

    matches.forEach(match => {
      context.report({
        message: `Avoid absolute file paths: ${match.match}`,
        line: match.line,
        fix: 'Use relative paths or environment variables',
      });
    });
  },
};
