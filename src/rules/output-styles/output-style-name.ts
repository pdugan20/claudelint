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
    docs: {
      recommended: true,
      summary: 'Enforces lowercase-with-hyphens format for output style names.',
      rationale:
        'Inconsistent naming breaks style references; lowercase-hyphen names match file-system conventions.',
      details:
        'This rule validates the `name` field in output style frontmatter. The name must be ' +
        'lowercase with hyphens (e.g., `concise-prose`), under 64 characters, and must not ' +
        'contain XML-style tags. This is enforced via the OutputStyleFrontmatterSchema which ' +
        'applies `lowercaseHyphens()`, `max(64)`, and `noXMLTags()` validators.',
      examples: {
        incorrect: [
          {
            description: 'Output style with uppercase name',
            code: '---\nname: ConciseProse\ndescription: A concise prose style\n---',
            language: 'markdown',
          },
          {
            description: 'Output style with spaces in name',
            code: '---\nname: concise prose\ndescription: A concise prose style\n---',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Output style with valid lowercase-hyphen name',
            code: '---\nname: concise-prose\ndescription: A concise prose style\n---',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Rename the output style to use only lowercase letters and hyphens. ' +
        'Keep it under 64 characters and remove any XML tags.',
      relatedRules: ['output-style-description', 'output-style-examples'],
    },
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using lowercaseHyphens(), max(64), noXMLTags()
  },
};
