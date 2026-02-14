/**
 * Rule: skill-body-too-long
 *
 * Warns when SKILL.md body content exceeds recommended length.
 */

import { Rule } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';
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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-too-long.md',
    schema: z.object({
      maxLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxLines: 500,
    },
    docs: {
      summary: 'Warns when a SKILL.md body exceeds the maximum number of lines.',
      rationale:
        'Overly long skill bodies consume excessive context window space and slow down skill loading.',
      details:
        'This rule checks the body content of SKILL.md files (everything after the YAML frontmatter) ' +
        'and warns when it exceeds a configurable line count threshold. ' +
        'Overly long skill files are harder to maintain and slower for AI models to process. ' +
        'Detailed reference material should be extracted into separate files in a `references/` directory ' +
        'and linked from the main SKILL.md for progressive disclosure.',
      examples: {
        incorrect: [
          {
            description: 'SKILL.md with an excessively long body section',
            code: '---\nname: my-skill\n---\n\n# My Skill\n\n... (600+ lines of content) ...',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'SKILL.md with a concise body that links to reference files',
            code: '---\nname: my-skill\n---\n\n# My Skill\n\nCore instructions here.\n\nSee [detailed API reference](references/api.md) for more.',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Move detailed documentation, long code examples, and reference material into separate files ' +
        'under a `references/` directory. Link to these files from your SKILL.md so the AI model ' +
        'can load them on demand.',
      options: {
        maxLines: {
          type: 'number',
          description: 'Maximum number of lines allowed in the SKILL.md body',
          default: 500,
        },
      },
      optionExamples: [
        {
          description: 'Allow up to 800 lines in the body',
          config: { maxLines: 800 },
        },
        {
          description: 'Enforce a stricter 300-line limit',
          config: { maxLines: 300 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your skill genuinely requires a large inline body and splitting ' +
        'into reference files would harm usability.',
      relatedRules: ['skill-body-word-count'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract body content (everything after frontmatter)
    const body = extractBodyContent(fileContent);
    if (!body) {
      return; // No body content or invalid frontmatter
    }

    const lines = body.split('\n');
    const maxLines = (options as SkillBodyTooLongOptions).maxLines ?? 500;

    // Check if body is too long
    if (lines.length > maxLines) {
      context.report({
        message: `Body too long (${lines.length} lines)`,
      });
    }
  },
};
