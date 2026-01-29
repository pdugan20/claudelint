/**
 * Rule: output-style-examples
 *
 * Output style examples must be an array of strings
 *
 * This validation is implemented in OutputStyleFrontmatterSchema which validates
 * the field using Array of strings.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'output-style-examples',
    name: 'Output Style Examples Format',
    description: 'Output style examples must be an array of strings',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-examples.md',
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using Array of strings
  },
};
