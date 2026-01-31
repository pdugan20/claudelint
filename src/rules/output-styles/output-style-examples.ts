/**
 * Rule: output-style-examples
 *
 * Output style examples must be an array of strings
 *
 * Uses thin wrapper pattern: delegates to OutputStyleFrontmatterSchema.shape.examples for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { OutputStyleFrontmatterSchema } from '../../schemas/output-style-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'output-style-examples',
    name: 'Output Style Examples Format',
    description: 'Output style examples must be an array of strings',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/output-styles/output-style-examples.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.examples) {
      return;
    }

    const examplesSchema = OutputStyleFrontmatterSchema.shape.examples;
    const result = examplesSchema.safeParse(frontmatter.examples);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'examples');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
