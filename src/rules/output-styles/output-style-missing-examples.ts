/**
 * Rule: output-style-missing-examples
 *
 * Validates that output style includes an "Examples" section
 *
 * Output styles should include concrete examples demonstrating the
 * desired formatting and structure for effective communication.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent, hasMarkdownSection } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'output-style-missing-examples',
    name: 'Output Style Missing Examples',
    description: 'Output style should include an "Examples" section',
    category: 'OutputStyles',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/output-styles/output-style-missing-examples.md',
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate OUTPUT_STYLE.md files
    if (!filePath.endsWith('OUTPUT_STYLE.md')) {
      return;
    }

    const body = extractBodyContent(fileContent);
    const examplesRegex = /#{1,3}\s*examples?/i;

    if (!hasMarkdownSection(body, examplesRegex)) {
      context.report({
        message: 'Output style should include an "Examples" section demonstrating the style.',
      });
    }
  },
};
