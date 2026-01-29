/**
 * Rule: claude-md-filename-case-sensitive
 *
 * Detects case-only filename collisions that would cause issues on
 * case-insensitive filesystems (macOS/Windows).
 *
 * This is a cross-file validation rule - the actual validation logic
 * lives in the Claude.md validator which has access to all files.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-filename-case-sensitive',
    name: 'Filename Case Collision',
    description: 'Filename differs only in case from another file, causing conflicts on case-insensitive filesystems',
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
