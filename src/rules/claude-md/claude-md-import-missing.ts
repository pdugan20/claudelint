/**
 * Rule: claude-md-import-missing
 *
 * Detects imports to non-existent Claude.md files.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath } from '../../utils/filesystem/files';
import { dirname } from 'path';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-missing',
    name: 'Missing Import',
    description: 'Imported file does not exist',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-import-missing.md',
    docs: {
      recommended: true,
      summary: 'Detects @import directives that reference files which do not exist.',
      details:
        'When a CLAUDE.md file uses `@import` to include another file, the referenced file ' +
        'must exist on disk. A missing import means Claude Code will silently skip the content, ' +
        'leading to incomplete instructions being loaded. This rule resolves each import path ' +
        'relative to the importing file and verifies the target exists. Common causes include ' +
        'typos in the path, renamed files, or files that were deleted but not removed from imports.',
      examples: {
        incorrect: [
          {
            description: 'An @import referencing a file that does not exist',
            code: '# CLAUDE.md\n\n@import .claude/rules/coding-standarts.md',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'An @import referencing a file that exists on disk',
            code: '# CLAUDE.md\n\n@import .claude/rules/coding-standards.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Verify the import path is correct and the target file exists. Check for typos in ' +
        'the filename or directory. If the file was moved or renamed, update the `@import` ' +
        'path to match. If the file was intentionally deleted, remove the `@import` directive.',
      whenNotToUse:
        'There is no reason to disable this rule. Broken imports always indicate a problem ' +
        'that should be resolved.',
      relatedRules: ['claude-md-import-circular', 'claude-md-import-read-failed'],
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

      // Check if imported file exists
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        context.report({
          message: `Imported file not found: ${importInfo.path}. Create the file at ${resolvedPath} or fix the import path.`,
          line: importInfo.line,
          fix: `Create the file at ${resolvedPath} or fix the import path`,
        });
      }
    }
  },
};
