/**
 * Rule: output-style-name
 *
 * Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags
 *
 * This validation is implemented in OutputStyleFrontmatterSchema which validates
 * the field using lowercaseHyphens(), max(64), noXMLTags().
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'output-style-name',
    name: 'Output Style Name Format',
    description:
      'Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/output-styles/output-style-name',
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using lowercaseHyphens(), max(64), noXMLTags()
  },
};
