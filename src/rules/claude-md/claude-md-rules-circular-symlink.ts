/**
 * Rule: claude-md-rules-circular-symlink
 *
 * Detects circular symlinks in the .claude directory that would cause
 * infinite loops during directory traversal.
 *
 * This is a cross-file validation rule - the actual validation logic
 * lives in the Claude.md validator which has access to filesystem state.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-rules-circular-symlink',
    name: 'Circular Symlink',
    description: 'Circular symlink detected in .claude directory',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
  },
  validate: () => {
    // No-op: This rule requires filesystem context and is validated
    // by the Claude.md validator (src/validators/claude-md.ts)
  },
};
