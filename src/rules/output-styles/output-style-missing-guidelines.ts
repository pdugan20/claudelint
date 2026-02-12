/**
 * Rule: output-style-missing-guidelines
 *
 * Validates that output style includes a "Guidelines" or "Format" section
 *
 * Output styles should document formatting rules and guidelines to ensure
 * consistent application of the style across different contexts.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent, hasMarkdownSection } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'output-style-missing-guidelines',
    name: 'Output Style Missing Guidelines',
    description: 'Output style should include a "Guidelines" or "Format" section',
    category: 'OutputStyles',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-missing-guidelines.md',
    docs: {
      recommended: true,
      summary: 'Warns when an output style lacks a Guidelines or Format section.',
      details:
        'This rule checks the body of output style markdown files for a heading ' +
        'that matches "Guidelines", "Rules", or "Format" (case-insensitive, headings ' +
        'level 1-3). Output styles should document their formatting rules and ' +
        'guidelines in a dedicated section so that the instructions are clearly ' +
        'structured and easy to follow. Without such a section, the style definition ' +
        'may be ambiguous or difficult for models to apply consistently.',
      examples: {
        incorrect: [
          {
            description: 'Output style without a Guidelines or Format section',
            code:
              '---\nname: technical\ndescription: Technical writing style\n---\n\n' +
              '# Technical Style\n\n' +
              'Write in a technical manner with precise language.\n' +
              'Use code blocks for examples.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Output style with a Guidelines section',
            code:
              '---\nname: technical\ndescription: Technical writing style\n---\n\n' +
              '# Technical Style\n\n' +
              '## Guidelines\n\n' +
              '- Use precise, unambiguous language\n' +
              '- Include code blocks for all examples\n' +
              '- Define acronyms on first use',
            language: 'markdown',
          },
          {
            description: 'Output style with a Format section',
            code:
              '---\nname: report\ndescription: Report output format\n---\n\n' +
              '# Report Format\n\n' +
              '## Format\n\n' +
              '- Start with a summary paragraph\n' +
              '- Use numbered headings for sections\n' +
              '- End with recommendations',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add a `## Guidelines`, `## Rules`, or `## Format` section to the output ' +
        'style body. Document the formatting rules, conventions, and any special ' +
        'instructions within that section.',
      relatedRules: ['output-style-body-too-short'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate .md files (output style files)
    if (!filePath.endsWith('.md')) {
      return;
    }

    const body = extractBodyContent(fileContent);
    const guidelinesRegex = /#{1,3}\s*(guidelines?|rules?|format)/i;

    if (!hasMarkdownSection(body, guidelinesRegex)) {
      context.report({
        message: 'Output style should include a "Guidelines" or "Format" section.',
      });
    }
  },
};
