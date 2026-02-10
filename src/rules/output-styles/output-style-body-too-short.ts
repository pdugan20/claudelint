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
