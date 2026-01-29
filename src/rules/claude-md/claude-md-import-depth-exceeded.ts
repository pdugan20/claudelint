/**
 * Rule: claude-md-import-depth-exceeded
 *
 * Validates that import depth doesn't exceed maximum.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/file-system';
import { dirname } from 'path';
import { CLAUDE_MD_MAX_IMPORT_DEPTH } from '../../validators/constants';

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-depth-exceeded',
    name: 'CLAUDE.md Import Depth Exceeded',
    description: 'Import depth exceeds maximum, possible circular import',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-import-depth-exceeded.md',
  },

  validate: async (context) => {
    const { filePath, fileContent, options } = context;
    const maxDepth = (options?.maxDepth as number | undefined) ?? CLAUDE_MD_MAX_IMPORT_DEPTH;

    // Check imports recursively
    await checkImportDepth(context, filePath, fileContent, 0, maxDepth, new Set());
  },
};

async function checkImportDepth(
  context: Parameters<Rule['validate']>[0],
  filePath: string,
  content: string,
  depth: number,
  maxDepth: number,
  visited: Set<string>
): Promise<void> {
  if (depth > maxDepth) {
    context.report({
      message: `Import depth exceeds maximum of ${maxDepth}. Possible circular import.`,
    });
    return;
  }

  // Prevent infinite recursion
  if (visited.has(filePath)) {
    return;
  }
  visited.add(filePath);

  // Extract imports
  const imports = extractImportsWithLineNumbers(content);

  for (const importInfo of imports) {
    // Resolve import path
    const baseDir = dirname(filePath);
    const resolvedPath = resolvePath(baseDir, importInfo.path);

    // Check if file exists
    const exists = await fileExists(resolvedPath);
    if (!exists) {
      continue; // Missing file handled by claude-md-import-missing
    }

    // Read and recurse
    try {
      const importedContent = await readFileContent(resolvedPath);
      await checkImportDepth(context, resolvedPath, importedContent, depth + 1, maxDepth, visited);
    } catch {
      // Read errors handled by claude-md-import-read-failed
      continue;
    }
  }
}
