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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-size-warning.md',
    schema: z.object({
      maxSize: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSize: DEFAULT_MAX_SIZE,
    },
    docs: {
      recommended: true,
      summary: 'Warns when a CLAUDE.md file is approaching the maximum file size limit.',
      rationale:
        'An early warning gives time to reorganize content before hitting the hard size limit that triggers errors.',
      details:
        'This rule issues a warning when a CLAUDE.md file reaches or exceeds the warning ' +
        'threshold (default 35KB), signaling that the file is approaching the hard error limit ' +
        'of 40KB. The early warning gives you time to reorganize content into smaller files ' +
        'under `.claude/rules/` before hitting the error threshold. Proactive splitting avoids ' +
        'context window issues and keeps instructions well-organized.',
      examples: {
        incorrect: [
          {
            description: 'A CLAUDE.md file nearing 35KB with everything inlined',
            code: '# CLAUDE.md\n\n<!-- ~35,000 bytes of content -->\n## All Standards\n...(many sections inlined)...',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'A compact CLAUDE.md that delegates detail to imported rule files',
            code: '# CLAUDE.md\n\nHigh-level project instructions.\n\n@import .claude/rules/standards.md\n@import .claude/rules/testing.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Begin splitting the CLAUDE.md content into smaller files inside `.claude/rules/`. ' +
        'Move the largest or most self-contained sections first, replacing them with `@import` ' +
        'directives. This reduces the file size below the warning threshold.',
      optionExamples: [
        {
          description: 'Set a custom warning threshold of 30KB',
          config: { maxSize: 30000 },
        },
        {
          description: 'Use the default 35KB warning threshold',
          config: { maxSize: 35000 },
        },
      ],
      whenNotToUse:
        'This rule should always be enabled. The early warning helps prevent the hard error ' +
        'triggered by claude-md-size-error.',
      relatedRules: ['claude-md-size-error', 'claude-md-import-missing'],
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
