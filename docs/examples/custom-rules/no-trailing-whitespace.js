/**
 * Example custom rule with auto-fix support
 *
 * This rule detects trailing whitespace at the end of lines and provides
 * an automatic fix to remove it.
 *
 * Installation:
 * 1. Copy this file to .claudelint/rules/ in your project
 * 2. Run: claudelint check-all
 * 3. Run: claudelint check-all --fix (to apply auto-fixes)
 */

module.exports.rule = {
  meta: {
    id: 'no-trailing-whitespace',
    name: 'No Trailing Whitespace',
    description: 'Detects and removes trailing whitespace at the end of lines',
    category: 'Custom',
    severity: 'warning',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    const lines = context.fileContent.split('\n');
    const violations = [];

    // Find all lines with trailing whitespace
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimEnd();

      if (line !== trimmed) {
        violations.push({
          lineNumber: i + 1,
          originalLine: line,
          fixedLine: trimmed,
        });
      }
    }

    // Report violations with auto-fix
    if (violations.length > 0) {
      context.report({
        message: `Found ${violations.length} line(s) with trailing whitespace`,
        line: violations[0].lineNumber,
        fix: 'Remove trailing whitespace from all lines',
        autoFix: {
          ruleId: 'no-trailing-whitespace',
          description: 'Remove trailing whitespace from all lines',
          filePath: context.filePath,
          apply: (currentContent) => {
            // Split into lines, trim each line's end, rejoin
            return currentContent
              .split('\n')
              .map((line) => line.trimEnd())
              .join('\n');
          },
        },
      });
    }
  },
};
