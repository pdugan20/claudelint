/**
 * Rule: claude-md-size-error
 *
 * Validates that CLAUDE.md files do not exceed the maximum file size limit.
 * Large files cause performance issues and may exceed context window limits.
 */

import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/file-system';
import { z } from 'zod';
import { CLAUDE_MD_SIZE_ERROR_THRESHOLD } from '../../validators/constants';

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
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-size-error.md',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSize: 40000, // 40KB
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;

    // Get configured threshold or use default
    const errorThreshold =
      (options as ClaudeMdSizeErrorOptions).maxSize ??
      CLAUDE_MD_SIZE_ERROR_THRESHOLD;

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
