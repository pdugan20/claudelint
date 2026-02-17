/**
 * Custom rule: no-user-paths
 *
 * Detects hardcoded user-specific paths like /Users/name/ or /home/name/.
 * Demonstrates: pattern matching, findLinesMatching helper, contentWithoutCode.
 */

import type { Rule } from '../../src/types/rule';
import { findLinesMatching } from '../../src/utils/rules/helpers';

const USER_PATH_PATTERN = /(?:\/Users\/|\/home\/|C:\\Users\\)[^\s/\\]+/;

export const rule: Rule = {
  meta: {
    id: 'no-user-paths',
    name: 'No User Paths',
    description: 'CLAUDE.md must not contain hardcoded user-specific paths',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    since: '1.0.0',
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    // Use contentWithoutCode to avoid false positives in code examples
    const content = context.contentWithoutCode ?? context.fileContent;

    const matches = findLinesMatching(content, USER_PATH_PATTERN);
    for (const match of matches) {
      context.report({
        message: `Hardcoded user path: ${match.match}`,
        line: match.line,
        fix: 'Use a relative path or environment variable instead',
      });
    }
  },
};
