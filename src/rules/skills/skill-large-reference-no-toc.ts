/**
 * Rule: skill-large-reference-no-toc
 *
 * Warns when large SKILL.md files lack a table of contents.
 */

import { Rule } from '../../types/rule';
import { z } from 'zod';

/**
 * Options for skill-large-reference-no-toc rule
 */
export interface SkillLargeReferenceNoTocOptions {
  /** Minimum line count before table of contents required (default: 100) */
  minLines?: number;
}

/**
 * Validates that large SKILL.md files have a table of contents
 */
export const rule: Rule = {
  meta: {
    id: 'skill-large-reference-no-toc',
    name: 'Skill Large Reference No TOC',
    description: 'Large SKILL.md files should include a table of contents',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-large-reference-no-toc.md',
    schema: z.object({
      minLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLines: 100,
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract body content (everything after frontmatter)
    const parts = fileContent.split('---');
    if (parts.length < 3) {
      return; // No body content or invalid frontmatter
    }

    const body = parts.slice(2).join('---');
    const lines = body.split('\n');
    const minLines = (options as SkillLargeReferenceNoTocOptions).minLines ?? 100;

    // Check if large skill lacks table of contents
    if (lines.length > minLines) {
      const hasTOC = /^#{1,6}\s*(table of contents|toc|contents)/i.test(body);
      if (!hasTOC) {
        context.report({
          message: `SKILL.md is large (${lines.length} lines) but lacks a table of contents. ` +
            'Add a TOC section to help users navigate the document.',
        });
      }
    }
  },
};
