/**
 * Rule: claude-md-size-error
 *
 * Validates that CLAUDE.md files do not exceed the maximum file size limit.
 * Large files cause performance issues and may exceed context window limits.
 */

import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/filesystem/files';
import { z } from 'zod';

/**
 * Options for claude-md-size-error rule
 */
export interface ClaudeMdSizeErrorOptions {
  /** Maximum file size in bytes before reporting error (default: 40000) */
  maxSize?: number;
}

/**
 * CLAUDE.md size error rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-size-error',
    name: 'CLAUDE.md File Size Error',
    description: 'CLAUDE.md exceeds maximum file size limit',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-size-error.md',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSize: 40000, // 40KB
    },
    docs: {
      recommended: true,
      summary: 'Ensures CLAUDE.md files do not exceed the maximum file size limit.',
      details:
        'Large CLAUDE.md files cause performance issues and may exceed context window limits ' +
        'when loaded by Claude Code. This rule triggers an error when the file reaches or exceeds ' +
        '40KB (configurable). At this size, the file should be split into smaller, focused files ' +
        'under the `.claude/rules/` directory and referenced via `@import` directives. Keeping ' +
        'files under the limit ensures fast loading and reliable context injection.',
      examples: {
        incorrect: [
          {
            description: 'A CLAUDE.md file that exceeds 40KB with all instructions inlined',
            code: '# CLAUDE.md\n\n<!-- 40,000+ bytes of inlined instructions -->\n## Coding Standards\n...(thousands of lines)...\n## Testing Guidelines\n...(thousands of lines)...\n## Deployment Procedures\n...(thousands of lines)...',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description:
              'A well-organized CLAUDE.md that imports separate rule files to stay under the limit',
            code: '# CLAUDE.md\n\nCore project instructions go here.\n\n@import .claude/rules/coding-standards.md\n@import .claude/rules/testing-guidelines.md\n@import .claude/rules/deployment-procedures.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Split the CLAUDE.md content into smaller, focused files inside the `.claude/rules/` ' +
        'directory. Then replace the inlined content with `@import` directives pointing to ' +
        'each extracted file. Each rule file should cover a single concern.',
      optionExamples: [
        {
          description: 'Set a custom maximum file size of 50KB',
          config: { maxSize: 50000 },
        },
        {
          description: 'Use the default 40KB limit',
          config: { maxSize: 40000 },
        },
      ],
      whenNotToUse:
        'This rule should always be enabled. Exceeding the size limit can cause Claude Code ' +
        'to fail to load the file or truncate instructions.',
      relatedRules: ['claude-md-size-warning', 'claude-md-import-missing'],
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;

    // Get configured threshold (already has default from meta.defaultOptions)
    const errorThreshold = (options as ClaudeMdSizeErrorOptions).maxSize ?? 40000;

    // Check file size
    const size = await getFileSize(filePath);

    if (size >= errorThreshold) {
      context.report({
        message: `File exceeds ${errorThreshold / 1000}KB limit (${size} bytes)`,
        fix: 'Split content into smaller files in .claude/rules/ and use @imports',
      });
    }
  },
};
