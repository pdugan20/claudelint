/**
 * Rule: claude-md-import-missing
 *
 * Detects imports to non-existent Claude.md files.
 *
 * This is a cross-file validation rule - the actual validation logic
 * lives in the Claude.md validator which has access to all files.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-missing',
    name: 'Missing Import',
    description: 'Imported file does not exist',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: () => {
    // No-op: This rule requires cross-file context and is validated
    // by the Claude.md validator (src/validators/claude-md.ts)
  },
};
