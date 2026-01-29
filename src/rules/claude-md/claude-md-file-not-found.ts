/**
 * Rule: claude-md-file-not-found
 *
 * Validates that specified CLAUDE.md file exists.
 */

import { Rule } from '../../types/rule';

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
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-file-not-found.md',
  },

  validate: () => {
    // This rule is handled by validator file existence check
    // before validation starts. Keeping for completeness.
    // The validator checks file existence in findFiles() method.
  },
};
