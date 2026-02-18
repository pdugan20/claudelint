/**
 * Rule: claude-md-import-depth-exceeded
 *
 * Validates that import depth doesn't exceed maximum.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';
import { fileExists, resolvePath, readFileContent } from '../../utils/filesystem/files';
import { dirname } from 'path';
import { z } from 'zod';

/**
 * Options for claude-md-import-depth-exceeded rule
 */
export interface ClaudeMdImportDepthExceededOptions {
  /** Maximum import depth before reporting error (default: 5) */
  maxDepth?: number;
}

export const rule: Rule = {
  meta: {
    id: 'claude-md-import-depth-exceeded',
    name: 'CLAUDE.md Import Depth Exceeded',
    description: 'Import depth exceeds maximum, possible circular import',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-import-depth-exceeded',
    schema: z.object({
      maxDepth: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      maxDepth: 5,
    },
    docs: {
      recommended: true,
      summary: 'Errors when the @import nesting depth exceeds the configured maximum.',
      rationale:
        'Deeply nested import chains are hard to follow and may indicate undetected circular dependencies.',
      details:
        'Deeply nested import chains make CLAUDE.md configurations difficult to understand and ' +
        'may indicate accidental circular dependencies that the circular-import rule has not yet ' +
        'caught. This rule tracks the depth of the import tree as it recursively resolves ' +
        '`@import` directives. When the depth exceeds the configured maximum (default: 5), an ' +
        'error is reported. A depth of 5 means file A imports B, which imports C, which imports ' +
        'D, which imports E, which imports F -- at that point the nesting is flagged.',
      examples: {
        incorrect: [
          {
            description: 'An import chain that is too deep (depth > 5)',
            code:
              '# CLAUDE.md\n' +
              '@import .claude/rules/a.md\n\n' +
              '# a.md imports b.md, b.md imports c.md,\n' +
              '# c.md imports d.md, d.md imports e.md,\n' +
              '# e.md imports f.md -- depth 6 exceeds the limit',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'A flat import structure with minimal nesting',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/git.md\n' +
              '@import .claude/rules/testing.md\n' +
              '@import .claude/rules/api.md',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Flatten the import hierarchy by importing files directly from the main CLAUDE.md ' +
        'instead of chaining imports through intermediate files. If files genuinely need to share ' +
        'content, extract the shared content into a common file imported by both.',
      optionExamples: [
        {
          description: 'Allow deeper nesting up to 10 levels',
          config: { maxDepth: 10 },
        },
        {
          description: 'Strict mode: limit to 3 levels of nesting',
          config: { maxDepth: 3 },
        },
      ],
      whenNotToUse:
        'Disable this rule only if your project has a legitimate reason for deeply nested ' +
        'imports, such as a multi-team monorepo with layered configuration.',
      relatedRules: ['claude-md-import-circular', 'claude-md-import-missing'],
    },
  },

  validate: async (context) => {
    const { filePath, fileContent, options } = context;
    const maxDepth = (options as ClaudeMdImportDepthExceededOptions).maxDepth ?? 5;

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
      message: `Import depth exceeds maximum (${maxDepth})`,
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
