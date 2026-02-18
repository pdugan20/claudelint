/**
 * Rule: claude-md-rules-circular-symlink
 *
 * Detects circular symlinks that would cause infinite loops during
 * import resolution.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath } from '../../utils/filesystem/files';
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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-rules-circular-symlink',
    schema: z.object({
      maxSymlinkDepth: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxSymlinkDepth: 100,
    },
    docs: {
      recommended: true,
      summary:
        'Detects circular symlinks in import paths that would cause infinite resolution loops.',
      rationale:
        'Circular symlinks cause infinite recursion during import resolution, hanging or crashing the tool.',
      details:
        'Symbolic links can create cycles where a symlink points to a path that eventually ' +
        'resolves back to itself. When Claude Code attempts to resolve `@import` directives, a ' +
        'circular symlink would cause infinite recursion. This rule checks each imported file to ' +
        'determine if it is a symlink and, if so, follows the symlink chain up to the configured ' +
        'maximum depth (default: 100). If the chain revisits a path or exceeds the depth limit, ' +
        'a circular symlink is reported.',
      examples: {
        incorrect: [
          {
            description: 'An import that resolves to a circular symlink',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/shared.md\n\n' +
              '# Where shared.md is a symlink:\n' +
              '# shared.md -> ../other/rules.md -> ../../.claude/rules/shared.md',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'An import that resolves to a regular file or a non-circular symlink',
            code: '# CLAUDE.md\n\n' + '@import .claude/rules/coding-standards.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Remove or recreate the symlink so it points to the correct target without creating a ' +
        'cycle. Use `ls -la` to inspect the symlink chain and `readlink -f` to see the final ' +
        'resolved path. Replace the circular symlink with a regular file or a symlink that ' +
        'terminates at a real file.',
      optionExamples: [
        {
          description: 'Reduce the symlink depth limit to detect cycles faster',
          config: { maxSymlinkDepth: 50 },
        },
      ],
      whenNotToUse:
        'Disable this rule only if your project does not use symlinks for any imported files.',
      relatedRules: ['claude-md-import-circular', 'claude-md-import-missing'],
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
