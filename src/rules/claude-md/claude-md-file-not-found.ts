/**
 * Rule: claude-md-file-not-found
 *
 * Validates that specified CLAUDE.md file exists.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';

export const rule: Rule = {
  meta: {
    id: 'claude-md-file-not-found',
    name: 'CLAUDE.md File Not Found',
    description: 'Specified CLAUDE.md file path does not exist',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-file-not-found',
    docs: {
      recommended: true,
      summary: 'Ensures the specified CLAUDE.md file exists at the expected path.',
      rationale:
        'Without a CLAUDE.md file, Claude Code operates with no project-level guidance, reducing quality of assistance.',
      details:
        'This rule verifies that the CLAUDE.md file targeted for linting actually exists on ' +
        'disk. Without a CLAUDE.md file, Claude Code has no project-level instructions to load, ' +
        'which means the AI assistant operates without any custom guidance. This is the most ' +
        'fundamental check: if the file is missing, no other rules can run against it.',
      examples: {
        incorrect: [
          {
            description: 'Running claudelint when CLAUDE.md does not exist',
            code: '$ claudelint\nError: File not found: /path/to/project/CLAUDE.md',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'A project with a CLAUDE.md file present at the root',
            code: '# CLAUDE.md\n\nProject instructions for Claude Code.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Create a CLAUDE.md file at the project root (or at the path specified in your ' +
        'configuration). Add project-specific instructions that guide Claude Code behavior.',
      whenNotToUse:
        'Disable this rule only if you are intentionally running claudelint against a path ' +
        'that may not yet have a CLAUDE.md file, such as during project scaffolding.',
      relatedRules: ['claude-md-import-missing', 'claude-md-file-reference-invalid'],
    },
  },

  validate: async (context) => {
    const { filePath } = context;

    // Check if the file exists
    const exists = await fileExists(filePath);
    if (!exists) {
      context.report({
        message: `File not found: ${filePath}`,
      });
    }
  },
};
