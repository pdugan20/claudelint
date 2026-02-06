/**
 * Rule: skill-body-word-count
 *
 * Warns when the SKILL.md body exceeds 5,000 words.
 * Anthropic's guide recommends keeping skills concise; detailed content
 * should be moved to reference files for progressive disclosure.
 */

import { z } from 'zod';
import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-body-word-count',
    name: 'Skill Body Word Count',
    description: 'SKILL.md body exceeds recommended word count',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-word-count.md',
    schema: z.object({
      maxWords: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxWords: 5000,
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Strip frontmatter to get body only
    const bodyMatch = fileContent.match(/^---[\s\S]*?---\s*([\s\S]*)$/);
    const body = bodyMatch ? bodyMatch[1] : fileContent;

    // Count words (split on whitespace, filter empties)
    const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;

    const maxWords = (options.maxWords as number) ?? 5000;

    if (wordCount > maxWords) {
      context.report({
        message: `SKILL.md body is ${wordCount} words (max: ${maxWords}). Move detailed content to reference files for progressive disclosure.`,
      });
    }
  },
};
