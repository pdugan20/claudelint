/**
 * Rule: claude-md-content-too-many-sections
 *
 * Validates that CLAUDE.md files don't have excessive sections that make navigation difficult.
 * Too many sections indicate the file should be split into separate imported files.
 */

import { Rule } from '../../types/rule';
import { z } from 'zod';
import { CLAUDE_MD_MAX_SECTIONS } from '../../validators/constants';

/**
 * Options for claude-md-content-too-many-sections rule
 */
export interface ContentTooManySectionsOptions {
  /** Maximum number of sections (markdown headings) before warning (default: 20) */
  maxSections?: number;
}

/**
 * CLAUDE.md content organization rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-content-too-many-sections',
    name: 'CLAUDE.md Too Many Sections',
    description: 'CLAUDE.md has too many sections making it hard to navigate',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-content-too-many-sections.md',
    schema: z.object({
      maxSections: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSections: 20,
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    // Only validate main CLAUDE.md files (not imported rules)
    if (!filePath.endsWith('CLAUDE.md') || filePath.includes('.claude/rules/')) {
      return;
    }

    // Get configured threshold or use default
    const maxSections = (options as ContentTooManySectionsOptions).maxSections ?? CLAUDE_MD_MAX_SECTIONS;

    // Count markdown headings (sections)
    const headingRegex = /^#{1,6}\s+.+$/gm;
    const headings = fileContent.match(headingRegex) || [];
    const sectionCount = headings.length;

    if (sectionCount > maxSections) {
      context.report({
        message:
          `CLAUDE.md has ${sectionCount} sections (>${maxSections} is hard to navigate). ` +
          `Consider organizing content into separate files in .claude/rules/ directory. ` +
          `For example: .claude/rules/git.md, .claude/rules/api.md, .claude/rules/testing.md`,
        fix: 'Split content into topic-specific files in .claude/rules/ directory',
      });
    }
  },
};
