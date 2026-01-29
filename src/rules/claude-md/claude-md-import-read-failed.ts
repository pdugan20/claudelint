/**
 * Rule: claude-md-import-read-failed
 *
 * Detects when an imported file cannot be read.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-read-failed',
    name: 'CLAUDE.md Import Read Failed',
    description: 'Failed to read imported file',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-import-read-failed.md',
  },

  validate: () => {
    // This rule is handled during recursive import traversal in the validator
    // The validator attempts to read each imported file and reports read failures
    // Keeping this rule for configuration purposes
  },
};
