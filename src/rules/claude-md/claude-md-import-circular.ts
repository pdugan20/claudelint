/**
 * Rule: claude-md-import-circular
 *
 * Detects circular imports between Claude.md files that would cause
 * infinite loops during import resolution.
 *
 * This is a cross-file validation rule - the actual validation logic
 * lives in the Claude.md validator which has access to all files.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-circular',
    name: 'Circular Import',
    description: 'Circular import detected between Claude.md files',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: () => {
    // No-op: This rule requires cross-file context and is validated
    // by the Claude.md validator (src/validators/claude-md.ts)
  },
};
