/**
 * Rule: claude-md-size-warning
 *
 * Warns when CLAUDE.md file is approaching size limit and suggests using the
 * .claude/rules/ directory structure for better organization.
 */

import { Rule } from '../../types/rule';
import { getFileSize } from '../../utils/filesystem/files';
import { z } from 'zod';

const DEFAULT_MAX_SIZE = 35000;

/**
 * Options for claude-md-size-warning rule
 */
export interface ClaudeMdSizeWarningOptions {
  /** Maximum file size in bytes before reporting warning (default: 35000) */
  maxSize?: number;
}

/**
 * Size warning validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-size-warning',
    name: 'CLAUDE.md File Size Warning',
    description: 'CLAUDE.md file is approaching size limit',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-size-warning.md',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSize: DEFAULT_MAX_SIZE,
    },
  },

  validate: async (context) => {
    const { filePath, options } = context;
    const maxSize = (options as ClaudeMdSizeWarningOptions).maxSize ?? DEFAULT_MAX_SIZE;

    const size = await getFileSize(filePath);

    if (size >= maxSize) {
      context.report({
        message: `File approaching size limit (${size} bytes)`,
        fix: 'Consider organizing content into .claude/rules/ directory with @imports',
      });
    }
  },
};
