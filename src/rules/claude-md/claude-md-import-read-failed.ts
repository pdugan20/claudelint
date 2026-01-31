/**
 * Rule: claude-md-import-read-failed
 *
 * Detects when an imported file cannot be read.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/file-system';
import { dirname } from 'path';
import { formatError } from '../../utils/validation-helpers';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-read-failed',
    name: 'CLAUDE.md Import Read Failed',
    description: 'Failed to read imported file',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-import-read-failed.md',
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
