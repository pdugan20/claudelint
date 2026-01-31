/**
 * Rule: output-style-description
 *
 * Output style description must be at least 10 characters, written in third person, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to OutputStyleFrontmatterSchema.shape.description for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { OutputStyleFrontmatterSchema } from '../../schemas/output-style-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/markdown';

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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/output-styles/output-style-description.md',
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.description) {
      return;
    }

    const descriptionSchema = OutputStyleFrontmatterSchema.shape.description;
    const result = descriptionSchema.safeParse(frontmatter.description);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
