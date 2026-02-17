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
    description:
      'Output style description must be at least 10 characters, written in third person, with no XML tags',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/output-styles/output-style-description',
    docs: {
      recommended: true,
      summary: 'Enforces format requirements for output style descriptions.',
      rationale:
        'Short or first-person descriptions confuse model interpretation; third-person phrasing and minimum length ensure clarity.',
      details:
        'This rule validates the `description` field in output style frontmatter. The description ' +
        'must be at least 10 characters long, written in third person, and must not contain ' +
        'XML-style tags. This is enforced via the OutputStyleFrontmatterSchema which applies ' +
        '`min(10)`, `noXMLTags()`, and `thirdPerson()` validators.',
      examples: {
        incorrect: [
          {
            description: 'Description that is too short',
            code: '---\nname: concise-prose\ndescription: Brief\n---',
            language: 'markdown',
          },
          {
            description: 'Description in first person',
            code: '---\nname: concise-prose\ndescription: I write concise prose with short sentences\n---',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Valid third-person description with sufficient length',
            code: '---\nname: concise-prose\ndescription: Produces concise prose with short, direct sentences\n---',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Write the description in third person (e.g., "Produces..." not "I produce..."), ' +
        'ensure it is at least 10 characters, and remove any XML tags.',
      relatedRules: ['output-style-name', 'output-style-examples'],
    },
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using min(10), noXMLTags(), thirdPerson()
  },
};
