/**
 * Rule: skill-body-long-code-block
 *
 * Warns when SKILL.md body contains code blocks exceeding a threshold,
 * suggesting they be moved to reference files for progressive disclosure.
 */

import { Rule } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';
import { z } from 'zod';

/**
 * Options for skill-body-long-code-block rule
 */
export interface SkillBodyLongCodeBlockOptions {
  /** Maximum code block lines before warning (default: 20) */
  maxLines?: number;
}

export const rule: Rule = {
  meta: {
    id: 'skill-body-long-code-block',
    name: 'Skill Body Long Code Block',
    description: 'Long code blocks in SKILL.md should be moved to reference files',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-long-code-block.md',
    schema: z.object({
      maxLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxLines: 20,
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    if (!filePath.endsWith('SKILL.md')) return;

    const body = extractBodyContent(fileContent);
    if (!body) return;

    const maxLines = (options as SkillBodyLongCodeBlockOptions).maxLines ?? 20;
    const lines = body.split('\n');

    let inCodeBlock = false;
    let codeBlockStart = 0;
    let codeBlockLineCount = 0;
    // Track frontmatter line offset so we report correct line numbers
    const frontmatterEnd = fileContent.indexOf('---', fileContent.indexOf('---') + 3) + 3;
    const frontmatterLines = fileContent.substring(0, frontmatterEnd).split('\n').length;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (trimmed.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = i;
          codeBlockLineCount = 0;
        } else {
          // End of code block — check length
          if (codeBlockLineCount > maxLines) {
            context.report({
              message:
                `Code block is ${codeBlockLineCount} lines (max ${maxLines}). ` +
                'Move long code examples to the references/ directory.',
              line: frontmatterLines + codeBlockStart + 1,
            });
          }
          inCodeBlock = false;
          codeBlockLineCount = 0;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLineCount++;
      }
    }
  },
};
