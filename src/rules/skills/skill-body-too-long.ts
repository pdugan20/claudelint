/**
 * Rule: skill-body-too-long
 *
 * Warns when SKILL.md body content exceeds recommended length.
 */

import { Rule } from '../../types/rule';
import { z } from 'zod';

/**
 * Options for skill-body-too-long rule
 */
export interface SkillBodyTooLongOptions {
  /** Maximum body length in lines before warning (default: 500) */
  maxLines?: number;
}

/**
 * Validates SKILL.md body length
 */
export const rule: Rule = {
  meta: {
    id: 'skill-body-too-long',
    name: 'Skill Body Too Long',
    description: 'SKILL.md body should not exceed 500 lines',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-too-long.md',
    schema: z.object({
      maxLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxLines: 500,
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
    const maxLines = (options as SkillBodyTooLongOptions).maxLines ?? 500;

    // Check if body is too long
    if (lines.length > maxLines) {
      context.report({
        message:
          `SKILL.md body is very long (${lines.length} lines, >${maxLines} is hard to maintain). ` +
          'Consider splitting into multiple files or adding a table of contents.',
      });
    }
  },
};
