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
        message: `Skill description is ${description.length} characters (max: ${maxLength}). Shorten the description for better readability in skill listings.`,
      });
    }
  },
};
