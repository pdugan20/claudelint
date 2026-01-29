/**
 * Rule: claude-md-import-depth-exceeded
 *
 * Validates that import depth doesn't exceed maximum.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-depth-exceeded',
    name: 'CLAUDE.md Import Depth Exceeded',
    description: 'Import depth exceeds maximum, possible circular import',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-import-depth-exceeded.md',
  },

  validate: () => {
    // This rule is handled during recursive import traversal in the validator
    // The validator tracks depth and reports when maxDepth is exceeded
    // Keeping this rule for configuration purposes
  },
};
