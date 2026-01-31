/**
 * Example custom rule: max-file-size
 *
 * Enforces a maximum file size limit to keep documentation files
 * manageable and prevent context window issues.
 *
 * Demonstrates: countOccurrences helper
 */

const { countOccurrences } = require('claudelint/utils');

module.exports.rule = {
  meta: {
    id: 'max-file-size',
    name: 'Maximum File Size',
    description: 'Enforce maximum file size limit',
    category: 'Custom',
    severity: 'warning',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const maxSize = 5000; // characters
    const maxLines = 200; // lines

    const size = context.fileContent.length;
    const lineCount = countOccurrences(context.fileContent, '\n') + 1;

    // Check character limit
    if (size > maxSize) {
      context.report({
        message: `File size (${size} chars) exceeds maximum (${maxSize} chars)`,
        line: 1,
        fix: 'Split into smaller files or use imports',
      });
    }

    // Check line limit
    if (lineCount > maxLines) {
      context.report({
        message: `File has ${lineCount} lines, maximum is ${maxLines}`,
        line: 1,
        fix: 'Split into smaller, focused files',
      });
    }
  },
};
