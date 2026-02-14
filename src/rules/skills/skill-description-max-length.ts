/**
 * Rule: skill-description-max-length
 *
 * Warns when a skill description exceeds 1024 characters.
 * Long descriptions reduce readability in skill listings and menus.
 */

import { z } from 'zod';
import { Rule, RuleContext } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-description-max-length',
    name: 'Skill Description Max Length',
    description: 'Skill description exceeds maximum character length',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-description-max-length.md',
    schema: z.object({
      maxLength: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxLength: 1024,
    },
    docs: {
      summary: 'Warns when a skill description exceeds the maximum character length.',
      rationale:
        'Long descriptions are truncated in skill listings and menus, hiding important context.',
      details:
        'Long descriptions reduce readability in skill listings and menus. ' +
        'This rule checks the `description` field in SKILL.md frontmatter and reports when it exceeds ' +
        'the configurable maximum character count (default: 1024). ' +
        'Descriptions should be concise summaries; detailed documentation belongs in the body or reference files.',
      examples: {
        incorrect: [
          {
            description: 'Description exceeding 1024 characters',
            code: '---\nname: deploy\ndescription: This is an extremely long description that goes on and on about every detail of the deployment process including all edge cases, error handling, rollback procedures, monitoring setup, and more until it far exceeds the maximum allowed length...\n---',
          },
        ],
        correct: [
          {
            description: 'Concise description within the limit',
            code: '---\nname: deploy\ndescription: Deploys the application to the specified environment with rollback support\n---',
          },
        ],
      },
      howToFix:
        'Shorten the `description` field to a concise summary. Move detailed information ' +
        'to the SKILL.md body or reference files.',
      optionExamples: [
        {
          description: 'Allow up to 2048 characters',
          config: { maxLength: 2048 },
        },
        {
          description: 'Enforce a strict 256-character limit',
          config: { maxLength: 256 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your skill requires a longer description for adequate trigger phrase coverage ' +
        'and you accept reduced readability in listings.',
      relatedRules: ['skill-description', 'skill-description-quality'],
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent, options } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract frontmatter
    const frontmatterMatch = fileContent.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return;
    }

    // Find description in frontmatter
    const descriptionMatch = frontmatterMatch[1].match(/^description:\s*(.+(?:\n(?!\S).*)*)/m);
    if (!descriptionMatch) {
      return;
    }

    const description = descriptionMatch[1].trim();
    const maxLength = (options.maxLength as number) ?? 1024;

    if (description.length > maxLength) {
      context.report({
        message: `Description too long (${description.length}/${maxLength} characters)`,
      });
    }
  },
};
