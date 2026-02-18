/**
 * Rule: claude-md-import-circular
 *
 * Detects circular imports between Claude.md files that would cause
 * infinite loops during import resolution.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/filesystem/files';
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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-import-circular',
    docs: {
      recommended: true,
      summary:
        'Detects circular @import chains between CLAUDE.md files that would cause infinite loops.',
      rationale:
        'Circular imports cause infinite recursion during import resolution, crashing the tool.',
      details:
        'When CLAUDE.md files use `@import` directives to include other files, it is possible to ' +
        'create circular dependencies where file A imports file B, which imports file A again. ' +
        'This would cause infinite recursion during import resolution. This rule walks the full ' +
        'import tree, tracking each file in the chain. If a file appears twice in the same import ' +
        'path, a circular dependency is reported. The rule also detects self-imports where a file ' +
        'imports itself.',
      examples: {
        incorrect: [
          {
            description: 'File A imports file B, which imports file A (circular)',
            code:
              '# .claude/rules/api.md\n\n' +
              'API guidelines.\n\n' +
              '@import .claude/rules/auth.md\n\n' +
              '# .claude/rules/auth.md\n\n' +
              'Auth guidelines.\n\n' +
              '@import .claude/rules/api.md',
            language: 'markdown',
          },
          {
            description: 'A file that imports itself',
            code:
              '# .claude/rules/style.md\n\n' +
              'Style guidelines.\n\n' +
              '@import .claude/rules/style.md',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'A linear import chain with no cycles',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/api.md\n' +
              '@import .claude/rules/auth.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Remove the import that creates the cycle. Reorganize shared content into a separate ' +
        'file that both files can import independently, or merge the circularly dependent files ' +
        'into a single file.',
      whenNotToUse:
        'There is no reason to disable this rule. Circular imports always indicate a structural ' +
        'problem that should be resolved.',
      relatedRules: [
        'claude-md-import-missing',
        'claude-md-import-depth-exceeded',
        'claude-md-import-read-failed',
      ],
    },
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
