/**
 * Rule: claude-md-filename-case-sensitive
 *
 * Detects case-only filename collisions that would cause issues on
 * case-insensitive filesystems (macOS/Windows).
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/filesystem/files';
import { dirname, basename } from 'path';

export const rule: Rule = {
  meta: {
    id: 'claude-md-filename-case-sensitive',
    name: 'Filename Case Collision',
    description:
      'Filename differs only in case from another file, causing conflicts on case-insensitive filesystems',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-filename-case-sensitive.md',
  },

  validate: async (context) => {
    const { filePath, fileContent } = context;

    // Track case-insensitive paths
    const caseInsensitiveMap = new Map<string, string>();
    caseInsensitiveMap.set(filePath.toLowerCase(), filePath);

    // Check imports for case collisions
    await checkCaseSensitivity(context, filePath, fileContent, caseInsensitiveMap, new Set());
  },
};

async function checkCaseSensitivity(
  context: Parameters<Rule['validate']>[0],
  originFilePath: string,
  content: string,
  caseMap: Map<string, string>,
  visited: Set<string>
): Promise<void> {
  // Prevent infinite recursion
  if (visited.has(originFilePath)) {
    return;
  }
  visited.add(originFilePath);

  // Extract imports
  const imports = extractImportsWithLineNumbers(content);

  for (const importInfo of imports) {
    // Resolve import path
    const baseDir = dirname(originFilePath);
    const resolvedPath = resolvePath(baseDir, importInfo.path);

    // Check for case collision
    const normalized = resolvedPath.toLowerCase();
    const existingPath = caseMap.get(normalized);

    if (existingPath && existingPath !== resolvedPath) {
      context.report({
        message:
          `Case-sensitive filename collision detected: "${basename(resolvedPath)}" and "${basename(existingPath)}" differ only in case. ` +
          `This may cause issues on case-insensitive filesystems (macOS, Windows).`,
        line: importInfo.line,
      });
    } else {
      caseMap.set(normalized, resolvedPath);
    }

    // Check if file exists
    const exists = await fileExists(resolvedPath);
    if (!exists) {
      continue; // Missing file handled by claude-md-import-missing
    }

    // Read and recurse
    try {
      const importedContent = await readFileContent(resolvedPath);
      await checkCaseSensitivity(context, resolvedPath, importedContent, caseMap, visited);
    } catch {
      // Read errors handled by claude-md-import-read-failed
      continue;
    }
  }
}
