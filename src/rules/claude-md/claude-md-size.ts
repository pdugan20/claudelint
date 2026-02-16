/**
 * Rule: claude-md-size
 *
 * Validates that CLAUDE.md files do not exceed the maximum file size limit.
 * Claude Code warns at 40KB that performance degrades, so this rule catches
 * oversized files. Users can set a lower threshold for early warning.
 */

import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/filesystem/files';
import { z } from 'zod';

const DEFAULT_MAX_SIZE = 40000; // 40KB — matches Claude Code's warning threshold

/**
 * Options for claude-md-size rule
 */
export interface ClaudeMdSizeOptions {
  /** Maximum file size in bytes (default: 40000) */
  maxSize?: number;
}

/**
 * CLAUDE.md size rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-size',
    name: 'CLAUDE.md File Size',
    description: 'CLAUDE.md exceeds maximum file size limit',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-size.md',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSize: DEFAULT_MAX_SIZE,
    },
    docs: {
      recommended: true,
      summary: 'Ensures CLAUDE.md files do not exceed the maximum file size limit.',
      rationale:
        'Claude Code warns at 40KB that performance degrades. Oversized files may exceed context window limits, causing slow loading or truncated instructions.',
      details:
        'Claude Code warns when a CLAUDE.md file reaches 40KB, signaling that performance will degrade. ' +
        'This rule catches files at or above that threshold (configurable via `maxSize`). To fix, split ' +
        'content into smaller files under `.claude/rules/` and reference them via `@import` directives. ' +
        'You can also set a lower threshold to get warned earlier, before reaching the 40KB limit.',
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
        'each extracted file. Each rule file should cover a single concern. ' +
        'Or use the `/claudelint:optimize-cc-md` plugin skill for guided, interactive optimization.',
      optionExamples: [
        {
          description: 'Catch size issues early — warn at 30KB before hitting the 40KB limit',
          config: { maxSize: 30000 },
        },
        {
          description: 'Allow larger files up to 50KB',
          config: { maxSize: 50000 },
        },
      ],
      options: {
        maxSize: {
          type: 'number',
          description: 'Maximum file size in bytes (default: 40000)',
          default: DEFAULT_MAX_SIZE,
          examples: [
            {
              description: 'Catch size issues early — warn at 30KB before hitting the 40KB limit',
              config: { maxSize: 30000 },
            },
            {
              description: 'Allow larger files up to 50KB',
              config: { maxSize: 50000 },
            },
          ],
        },
      },
      whenNotToUse:
        'This rule should always be enabled. Files exceeding the size limit cause Claude Code ' +
        'to warn about degraded performance and may truncate instructions.',
      relatedRules: ['claude-md-import-missing', 'claude-md-content-too-many-sections'],
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;

    const maxSize = (options as ClaudeMdSizeOptions).maxSize ?? DEFAULT_MAX_SIZE;
    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      context.report({
        message: `File exceeds ${maxSize / 1000}KB limit (${size} bytes)`,
        fix: 'Split content into smaller files in .claude/rules/ and use @imports',
      });
    }
  },
};
