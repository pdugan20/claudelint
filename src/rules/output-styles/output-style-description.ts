/**
 * Rule: output-style-description
 *
 * Output style description must be at least 10 characters, written in third person, with no XML tags
 *
 * This validation is implemented in OutputStyleFrontmatterSchema which validates
 * the field using min(10), noXMLTags(), thirdPerson().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'output-style-description',
    name: 'Output Style Description Format',
    description: 'Output style description must be at least 10 characters, written in third person, with no XML tags',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-description.md',
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using min(10), noXMLTags(), thirdPerson()
  },
};
