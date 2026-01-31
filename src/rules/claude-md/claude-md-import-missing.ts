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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-import-missing.md',
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
