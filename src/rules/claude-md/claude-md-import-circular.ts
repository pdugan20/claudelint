/**
 * Rule: claude-md-import-circular
 *
 * Detects circular imports between Claude.md files that would cause
 * infinite loops during import resolution.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/file-system';
import { dirname } from 'path';
import { minimatch } from 'minimatch';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-circular',
    name: 'Circular Import',
    description: 'Circular import detected between Claude.md files',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-import-circular.md',
  },

  validate: async (context) => {
    const { filePath, fileContent, options } = context;
    const allowSelfReference = (options?.allowSelfReference as boolean | undefined) ?? false;
    const ignorePatterns = (options?.ignorePatterns as string[] | undefined) ?? [];

    // Check for circular imports
    await checkCircularImports(
      context,
      filePath,
      fileContent,
      new Set([filePath]),
      allowSelfReference,
      ignorePatterns
    );
  },
};

async function checkCircularImports(
  context: Parameters<Rule['validate']>[0],
  filePath: string,
  content: string,
  importChain: Set<string>,
  allowSelfReference: boolean,
  ignorePatterns: string[]
): Promise<void> {
  // Extract imports
  const imports = extractImportsWithLineNumbers(content);

  for (const importInfo of imports) {
    // Resolve import path
    const baseDir = dirname(filePath);
    const resolvedPath = resolvePath(baseDir, importInfo.path);

    // Check if this file should be ignored
    const shouldIgnore = ignorePatterns.some((pattern) => minimatch(resolvedPath, pattern));
    if (shouldIgnore) {
      continue;
    }

    // Check for self-reference
    if (filePath === resolvedPath) {
      if (!allowSelfReference) {
        context.report({
          message: `File imports itself: ${importInfo.path}`,
          line: importInfo.line,
        });
      }
      continue;
    }

    // Check for circular import
    if (importChain.has(resolvedPath)) {
      context.report({
        message: `Circular import detected: ${importInfo.path}`,
        line: importInfo.line,
      });
      continue;
    }

    // Check if file exists
    const exists = await fileExists(resolvedPath);
    if (!exists) {
      continue; // Missing file handled by claude-md-import-missing
    }

    // Read and recurse
    try {
      const importedContent = await readFileContent(resolvedPath);
      const newChain = new Set(importChain);
      newChain.add(resolvedPath);
      await checkCircularImports(
        context,
        resolvedPath,
        importedContent,
        newChain,
        allowSelfReference,
        ignorePatterns
      );
    } catch {
      // Read errors handled by claude-md-import-read-failed
      continue;
    }
  }
}
