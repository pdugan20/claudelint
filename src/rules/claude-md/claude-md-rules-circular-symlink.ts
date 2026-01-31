/**
 * Rule: claude-md-rules-circular-symlink
 *
 * Detects circular symlinks that would cause infinite loops during
 * import resolution.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/markdown';
import { fileExists, resolvePath } from '../../utils/file-system';
import { dirname } from 'path';
import { lstat, readlink } from 'fs/promises';
import { z } from 'zod';

/**
 * Options for claude-md-rules-circular-symlink rule
 */
export interface ClaudeMdRulesCircularSymlinkOptions {
  /** Maximum symlink chain depth before considering circular (default: 100) */
  maxSymlinkDepth?: number;
}

export const rule: Rule = {
  meta: {
    id: 'claude-md-rules-circular-symlink',
    name: 'Circular Symlink',
    description: 'Circular symlink detected in import path',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/claude-md/claude-md-rules-circular-symlink.md',
    schema: z.object({
      maxSymlinkDepth: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSymlinkDepth: 100,
    },
  },

  validate: async (context) => {
    const { filePath, fileContent, options } = context;
    const maxDepth = (options as ClaudeMdRulesCircularSymlinkOptions).maxSymlinkDepth ?? 100;

    // Extract imports
    const imports = extractImportsWithLineNumbers(fileContent);

    for (const importInfo of imports) {
      // Resolve import path
      const baseDir = dirname(filePath);
      const resolvedPath = resolvePath(baseDir, importInfo.path);

      // Check if file exists
      const exists = await fileExists(resolvedPath);
      if (!exists) {
        continue; // Missing file handled by claude-md-import-missing
      }

      // Check for circular symlink
      const hasSymlinkCycle = await checkSymlinkCycle(resolvedPath, maxDepth);
      if (hasSymlinkCycle) {
        context.report({
          message: `Circular symlink detected: ${importInfo.path}`,
          line: importInfo.line,
        });
      }
    }
  },
};

/**
 * Check if a path is involved in a circular symlink chain
 */
async function checkSymlinkCycle(filePath: string, maxDepth: number): Promise<boolean> {
  try {
    const stats = await lstat(filePath);

    if (!stats.isSymbolicLink()) {
      return false;
    }

    const visited = new Set<string>();
    let currentPath = filePath;
    visited.add(currentPath);

    // Follow symlink chain
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const linkStats = await lstat(currentPath);

      if (!linkStats.isSymbolicLink()) {
        break;
      }

      const targetPath = await readlink(currentPath);
      const resolvedTarget = resolvePath(dirname(currentPath), targetPath);

      // Check if we've created a cycle
      if (visited.has(resolvedTarget)) {
        return true;
      }

      visited.add(resolvedTarget);
      currentPath = resolvedTarget;

      // Safety limit to prevent infinite loops
      if (visited.size > maxDepth) {
        return true;
      }
    }

    return false;
  } catch {
    // If we can't read the symlink, it might be broken but not circular
    return false;
  }
}
