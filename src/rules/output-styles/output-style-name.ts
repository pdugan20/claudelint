/**
 * Rule: output-style-name
 *
 * Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to OutputStyleFrontmatterSchema.shape.name for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { OutputStyleFrontmatterSchema } from '../../schemas/output-style-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

export const rule: Rule = {
  meta: {
    id: 'output-style-name',
    name: 'Output Style Name Format',
    description: 'Output style name must be lowercase-with-hyphens, under 64 characters, with no XML tags',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-name.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return;
    }

    const nameSchema = OutputStyleFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
