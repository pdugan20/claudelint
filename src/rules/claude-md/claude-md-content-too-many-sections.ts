/**
 * Rule: claude-md-content-too-many-sections
 *
 * Validates that CLAUDE.md files don't have excessive sections that make navigation difficult.
 * Too many sections indicate the file should be split into separate imported files.
 */

import { Rule } from '../../types/rule';
import { z } from 'zod';

/**
 * Options for claude-md-content-too-many-sections rule
 */
export interface ClaudeMdContentTooManySectionsOptions {
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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-content-too-many-sections.md',
    schema: z.object({
      maxSections: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSections: 20,
    },
    docs: {
      recommended: true,
      summary:
        'Warns when a CLAUDE.md file has too many heading sections, suggesting it should be split.',
      details:
        'Large CLAUDE.md files with many sections become difficult for both humans and Claude Code to ' +
        'navigate. When the number of markdown headings exceeds the configured threshold (default: 20), ' +
        'this rule warns that the file should be reorganized. The recommended approach is to split ' +
        'content into topic-specific files under `.claude/rules/` and use `@import` directives to ' +
        'include them. This keeps each file focused and easier to maintain. The rule only checks ' +
        'top-level CLAUDE.md files, not files already in the `.claude/rules/` directory.',
      examples: {
        incorrect: [
          {
            description: 'A CLAUDE.md with too many sections (over 20 headings)',
            code:
              '# Project Instructions\n\n' +
              '## Git Workflow\n...\n\n## Code Style\n...\n\n## Testing\n...\n\n' +
              '## API Guidelines\n...\n\n## Database\n...\n\n## Auth\n...\n\n' +
              '## Logging\n...\n\n## Error Handling\n...\n\n## Deployment\n...\n\n' +
              '## Monitoring\n...\n\n## Security\n...\n\n## Performance\n...\n\n' +
              '## Accessibility\n...\n\n## i18n\n...\n\n## CI/CD\n...\n\n' +
              '## Docker\n...\n\n## Kubernetes\n...\n\n## AWS\n...\n\n' +
              '## Terraform\n...\n\n## Documentation\n...\n\n## Reviews\n...',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'A CLAUDE.md that imports topic-specific rule files',
            code:
              '# Project Instructions\n\n' +
              '## Overview\n\nBrief project description.\n\n' +
              '@import .claude/rules/git.md\n' +
              '@import .claude/rules/code-style.md\n' +
              '@import .claude/rules/testing.md\n' +
              '@import .claude/rules/deployment.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Split the CLAUDE.md file into smaller, topic-specific files in the `.claude/rules/` ' +
        'directory. Use `@import` directives in the main CLAUDE.md to include them. For example, ' +
        'move git-related instructions to `.claude/rules/git.md` and testing guidelines to ' +
        '`.claude/rules/testing.md`.',
      optionExamples: [
        {
          description: 'Allow up to 30 sections before warning',
          config: { maxSections: 30 },
        },
        {
          description: 'Strict mode: warn after 10 sections',
          config: { maxSections: 10 },
        },
      ],
      whenNotToUse:
        'Disable this rule if your project intentionally maintains a single large CLAUDE.md ' +
        'file and the team finds the flat structure easier to manage.',
      relatedRules: ['claude-md-import-missing', 'claude-md-size-warning'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;

    // Only validate main CLAUDE.md files (not imported rules)
    if (!filePath.endsWith('CLAUDE.md') || filePath.includes('.claude/rules/')) {
      return;
    }

    // Get configured threshold (already has default from meta.defaultOptions)
    const maxSections = (options as ClaudeMdContentTooManySectionsOptions).maxSections ?? 20;

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
