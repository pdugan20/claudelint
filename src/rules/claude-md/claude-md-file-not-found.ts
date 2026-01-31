/**
 * Rule: claude-md-file-not-found
 *
 * Validates that specified CLAUDE.md file exists.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';

export const rule: Rule = {
  meta: {
    id: 'claude-md-file-not-found',
    name: 'CLAUDE.md File Not Found',
    description: 'Specified CLAUDE.md file path does not exist',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-file-not-found.md',
  },

  validate: async (context) => {
    const { filePath } = context;

    // Check if the file exists
    const exists = await fileExists(filePath);
    if (!exists) {
      context.report({
        message: `File not found: ${filePath}`,
      });
    }
  },
};
