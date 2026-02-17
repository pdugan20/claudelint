/**
 * Custom rule: max-section-depth
 *
 * Limits heading depth in CLAUDE.md to keep structure flat and scannable.
 * Demonstrates: configurable options with meta.schema (Zod), defaultOptions, extractHeadings.
 */

import { z } from 'zod';
import type { Rule } from '../../src/types/rule';
import { extractHeadings } from '../../src/utils/rules/helpers';

const optionsSchema = z.object({
  maxDepth: z.number().int().min(1).max(6).optional(),
});

export const rule: Rule = {
  meta: {
    id: 'max-section-depth',
    name: 'Max Section Depth',
    description: 'CLAUDE.md headings must not exceed a configurable depth',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    schema: optionsSchema,
    defaultOptions: {
      maxDepth: 4,
    },
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    const maxDepth = (context.options.maxDepth as number) ?? 4;
    const headings = extractHeadings(context.fileContent);

    for (const heading of headings) {
      if (heading.level > maxDepth) {
        context.report({
          message: `Heading "${'#'.repeat(heading.level)} ${heading.text}" exceeds max depth ${maxDepth}`,
          line: heading.line,
          fix: `Restructure to use heading level ${maxDepth} or shallower`,
        });
      }
    }
  },
};
