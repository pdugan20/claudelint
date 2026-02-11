/**
 * Rule: output-style-body-too-short
 *
 * Validates that output style body content meets minimum length requirements
 *
 * Output styles should include substantive examples and guidelines beyond frontmatter.
 * Very short body content suggests incomplete documentation.
 *
 * Options:
 * - minLength: Minimum body content length (default: 50)
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';
import { z } from 'zod';

/**
 * Options for output-style-body-too-short rule
 */
export interface OutputStyleBodyTooShortOptions {
  /** Minimum body content length in characters (default: 50) */
  minLength?: number;
}

export const rule: Rule = {
  meta: {
    id: 'output-style-body-too-short',
    name: 'Output Style Body Too Short',
    description: 'Output style body content should meet minimum length requirements',
    category: 'OutputStyles',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-body-too-short.md',
    schema: z.object({
      minLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLength: 50,
    },
    docs: {
      summary: 'Warns when output style body content is too short.',
      details:
        'This rule checks the body of output style markdown files (everything after ' +
        'the YAML frontmatter) and warns when the content is shorter than the configured ' +
        'minimum length. Output styles need substantive content including formatting ' +
        'examples, guidelines, and instructions to be effective. Very short body content ' +
        'suggests the style definition is incomplete or lacks enough detail to guide ' +
        'output formatting consistently.',
      examples: {
        incorrect: [
          {
            description: 'Output style with minimal body content',
            code: '---\nname: concise\ndescription: Concise output style\n---\n\nBe concise.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Output style with substantive body content',
            code:
              '---\nname: concise\ndescription: Concise output style\n---\n\n' +
              '# Concise Style\n\n' +
              '## Guidelines\n\n' +
              '- Use short, direct sentences\n' +
              '- Avoid filler words and unnecessary qualifiers\n' +
              '- Lead with the most important information\n' +
              '- Use bullet points for lists of 3+ items\n\n' +
              '## Examples\n\n' +
              'Instead of "It might be worth considering..." write "Consider..."',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Add more detail to the output style body. Include sections for guidelines, ' +
        'formatting rules, examples of correct and incorrect output, and any special ' +
        'instructions for applying the style.',
      options: {
        minLength: {
          type: 'number',
          description: 'Minimum body content length in characters',
          default: 50,
        },
      },
      optionExamples: [
        {
          description: 'Require at least 100 characters of body content',
          config: { minLength: 100 },
        },
        {
          description: 'Allow shorter body content for simple styles',
          config: { minLength: 20 },
        },
      ],
      whenNotToUse:
        'Disable this rule for intentionally minimal output styles that rely on ' +
        'a short description and a few key directives rather than extensive documentation.',
      relatedRules: ['output-style-missing-guidelines'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate .md files (output style files)
    if (!filePath.endsWith('.md')) {
      return;
    }

    const ruleOptions = options as OutputStyleBodyTooShortOptions;
    const minLength = ruleOptions?.minLength ?? 50;

    const body = extractBodyContent(fileContent);

    if (body.length < minLength) {
      context.report({
        message: `Output style body content is very short (${body.length} characters). Consider adding more examples and guidelines. (minimum: ${minLength})`,
      });
    }
  },
};
