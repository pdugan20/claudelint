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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-body-long-code-block',
    schema: z.object({
      maxLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxLines: 20,
    },
    docs: {
      summary: 'Warns when code blocks in a SKILL.md body exceed a configurable line threshold.',
      rationale:
        'Oversized code blocks bloat the skill payload and waste context window tokens during execution.',
      details:
        'This rule scans the body of SKILL.md files for fenced code blocks (triple backticks) and ' +
        'reports any that exceed the maximum line count. Long code blocks inflate the skill file size, ' +
        'slow down AI model processing, and make the skill harder to maintain. ' +
        'Large code examples and templates should be moved to separate files in the `references/` directory ' +
        'and linked from the main SKILL.md for progressive disclosure.',
      examples: {
        incorrect: [
          {
            description: 'Code block exceeding the default 20-line limit',
            code:
              '---\nname: setup\ndescription: Sets up the development environment\n---\n\n## Usage\n\n' +
              '```bash\n# Line 1\n# Line 2\n# ...\n# Line 25\n```',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Short code block within the limit',
            code:
              '---\nname: setup\ndescription: Sets up the development environment\n---\n\n## Usage\n\n' +
              '```bash\nnpm install\nnpm run build\n```',
            language: 'markdown',
          },
          {
            description: 'Long code moved to a reference file',
            code:
              '---\nname: setup\ndescription: Sets up the development environment\n---\n\n## Usage\n\n' +
              'See [full setup script](references/setup.sh) for the complete configuration.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Move the long code block into a file under the `references/` directory and link to it from ' +
        'the SKILL.md body. Keep only short, illustrative snippets inline.',
      optionExamples: [
        {
          description: 'Allow up to 40 lines per code block',
          config: { maxLines: 40 },
        },
        {
          description: 'Enforce a strict 10-line limit',
          config: { maxLines: 10 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your skill requires inline code blocks that cannot be meaningfully ' +
        'extracted into separate reference files.',
      relatedRules: ['skill-body-too-long', 'skill-body-word-count'],
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
              message: `Code block too long (${codeBlockLineCount}/${maxLines} lines)`,
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
