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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/output-styles/output-style-examples',
    docs: {
      recommended: true,
      summary: 'Enforces that output style examples are an array of strings.',
      rationale:
        'Non-array examples break style rendering; consistent format ensures models can parse example output.',
      details:
        'This rule validates the `examples` field in output style frontmatter. The field must ' +
        'be an array of strings, where each string demonstrates the style in action. This is ' +
        'enforced via the OutputStyleFrontmatterSchema which validates the field as an array ' +
        'of strings.',
      examples: {
        incorrect: [
          {
            description: 'Examples as a single string instead of array',
            code: '---\nname: concise-prose\ndescription: A concise prose style\nexamples: "Be brief."\n---',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Examples as an array of strings',
            code: '---\nname: concise-prose\ndescription: A concise prose style\nexamples:\n  - "Use short sentences."\n  - "Lead with the key point."\n---',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Change the `examples` field to a YAML array of strings. Each entry should be a ' +
        'short demonstration of the output style.',
      relatedRules: ['output-style-name', 'output-style-description'],
    },
  },
  validate: () => {
    // No-op: Validation implemented in OutputStyleFrontmatterSchema
    // Schema validates using Array of strings
  },
};
