/**
 * Rule: claude-md-import-read-failed
 *
 * Detects when an imported file cannot be read.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/filesystem/files';
import { dirname } from 'path';
import { formatError } from '../../utils/validators/helpers';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-read-failed',
    name: 'CLAUDE.md Import Read Failed',
    description: 'Failed to read imported file',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-import-read-failed',
    docs: {
      recommended: true,
      summary:
        'Errors when an imported file exists but cannot be read due to permission or encoding issues.',
      rationale:
        'An unreadable import silently drops instructions, leaving Claude Code with incomplete project guidance.',
      details:
        'This rule complements `claude-md-import-missing` by catching a different failure mode: ' +
        'the imported file exists on disk, but reading its contents fails. Common causes include ' +
        'insufficient file permissions, the file being a directory instead of a regular file, ' +
        'binary files that cannot be read as text, or filesystem-level errors. The rule first ' +
        'confirms the file exists (deferring to `claude-md-import-missing` otherwise), then ' +
        'attempts to read it and reports any errors encountered.',
      examples: {
        incorrect: [
          {
            description: 'Importing a file that exists but is not readable',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/secrets.md\n\n' +
              '# Where secrets.md has permissions set to 000 (no read access)',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Importing a file that exists and is readable',
            code: '# CLAUDE.md\n\n' + '@import .claude/rules/coding-standards.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Check the file permissions with `ls -la` and ensure the file is readable. If the file ' +
        'is a binary file, it should not be imported into CLAUDE.md. Verify the path does not ' +
        'point to a directory.',
      whenNotToUse:
        'There is no reason to disable this rule. An unreadable import always indicates a problem ' +
        'that needs to be fixed.',
      relatedRules: ['claude-md-import-missing', 'claude-md-import-circular'],
    },
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Extract imports from markdown content
    const imports = extractImportsWithLineNumbers(fileContent);

    for (const importInfo of imports) {
      // Resolve import path relative to current file
      const baseDir = dirname(filePath);
      const resolvedPath = resolvePath(baseDir, importInfo.path);

      // Check if file exists first
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        // File not found is handled by claude-md-import-missing rule
        continue;
      }

      // Try to read the file
      try {
        await readFileContent(resolvedPath);
      } catch (error) {
        context.report({
          message: `Failed to read imported file: ${formatError(error)}`,
          line: importInfo.line,
        });
      }
    }
  },
};
