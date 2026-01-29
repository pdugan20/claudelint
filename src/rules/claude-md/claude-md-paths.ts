/**
 * Rule: claude-md-paths
 *
 * Claude MD paths must be a non-empty array with at least one path pattern
 *
 * This validation is implemented in ClaudeMdFrontmatterSchema which validates
 * the field using Array of strings, min 1 item, each string min 1 character.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'claude-md-paths',
    name: 'Claude MD Paths Format',
    description: 'Claude MD paths must be a non-empty array with at least one path pattern',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-paths.md',
  },
  validate: () => {
    // No-op: Validation implemented in ClaudeMdFrontmatterSchema
    // Schema validates using Array of strings, min 1 item, each string min 1 character
  },
};
