/**
 * Rule: skill-body-word-count
 *
 * Warns when the SKILL.md body exceeds 5,000 words.
 * Anthropic's guide recommends keeping skills concise; detailed content
 * should be moved to reference files for progressive disclosure.
 */

import { z } from 'zod';
import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';

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
    docUrl: 'https://claudelint.com/rules/skills/skill-body-word-count',
    schema: z.object({
      maxWords: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxWords: 5000,
    },
    docs: {
      summary: 'Warns when a SKILL.md body exceeds the maximum word count.',
      rationale:
        'Excessive word counts waste context window tokens and reduce focus on actionable instructions.',
      details:
        'This rule counts the words in the body of SKILL.md files (everything after the YAML frontmatter) ' +
        'and warns when the count exceeds a configurable threshold. ' +
        'Anthropic recommends keeping skills concise so AI models can process them efficiently. ' +
        'Lengthy content should be moved to reference files for progressive disclosure, ' +
        'allowing the model to load detailed information only when needed.',
      examples: {
        incorrect: [
          {
            description: 'SKILL.md with a body exceeding 5,000 words',
            code: '---\nname: my-skill\n---\n\n# My Skill\n\n... (5,000+ words of inline content) ...',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'SKILL.md with concise body and references to external files',
            code: '---\nname: my-skill\n---\n\n# My Skill\n\nBrief overview and core instructions.\n\nFor details, see [reference docs](references/details.md).',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Extract verbose sections, long examples, and reference material into separate files ' +
        'under a `references/` directory. Keep the SKILL.md body focused on essential instructions ' +
        'and link to the extracted files.',
      options: {
        maxWords: {
          type: 'number',
          description: 'Maximum number of words allowed in the SKILL.md body',
          default: 5000,
        },
      },
      optionExamples: [
        {
          description: 'Allow up to 8,000 words in the body',
          config: { maxWords: 8000 },
        },
        {
          description: 'Enforce a stricter 3,000-word limit',
          config: { maxWords: 3000 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your skill requires extensive inline documentation and ' +
        'splitting into reference files would reduce clarity or usability.',
      relatedRules: ['skill-body-too-long'],
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Use shared utility for frontmatter-aware body extraction
    const body = extractBodyContent(fileContent) || fileContent;

    // Count words (split on whitespace, filter empties)
    const wordCount = body.split(/\s+/).filter((w) => w.length > 0).length;

    const maxWords = (options.maxWords as number) ?? 5000;

    if (wordCount > maxWords) {
      context.report({
        message: `Body too long (${wordCount}/${maxWords} words)`,
      });
    }
  },
};
