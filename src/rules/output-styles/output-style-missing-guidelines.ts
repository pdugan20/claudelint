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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/output-styles/output-style-missing-guidelines.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate OUTPUT_STYLE.md files
    if (!filePath.endsWith('OUTPUT_STYLE.md')) {
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
