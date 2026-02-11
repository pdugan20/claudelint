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
    docs: {
      recommended: true,
      summary:
        'Detects import paths that differ only in letter case, causing conflicts on ' +
        'case-insensitive filesystems.',
      details:
        'On case-insensitive filesystems like macOS (HFS+/APFS) and Windows (NTFS), files named ' +
        '`Rules.md` and `rules.md` resolve to the same file. However, on Linux (ext4), they are ' +
        'distinct files. When a CLAUDE.md import tree contains paths that differ only in case, the ' +
        'project will behave differently depending on the operating system. This rule recursively ' +
        'walks the import tree and tracks all resolved paths in a case-insensitive map. If two ' +
        'imports resolve to paths that differ only in case, an error is reported.',
      examples: {
        incorrect: [
          {
            description: 'Two imports that differ only in case',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/Git-Workflow.md\n' +
              '@import .claude/rules/git-workflow.md',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Imports with consistent, unique casing',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/git-workflow.md\n' +
              '@import .claude/rules/code-style.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Rename one of the conflicting files so the names are distinct even when compared ' +
        'case-insensitively. Use a consistent naming convention (e.g., all lowercase with ' +
        'hyphens) for all imported files.',
      whenNotToUse:
        'Disable this rule only if your project exclusively targets Linux and you intentionally ' +
        'maintain files that differ only in case. This is rare and generally discouraged.',
      relatedRules: ['claude-md-import-missing', 'claude-md-import-circular'],
    },
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
