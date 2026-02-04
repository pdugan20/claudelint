/**
 * Rule: claude-md-import-in-code-block
 *
 * Errors when import statements are found inside fenced code blocks.
 * Imports in code blocks are not processed by Claude Code and will be ignored.
 */

import { Rule } from '../../types/rule';

/**
 * Import in code block validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-import-in-code-block',
    name: 'Import In Code Block',
    description: 'Import statement found inside code block',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-import-in-code-block.md',
  },

  validate: (context) => {
    const { fileContent } = context;
    const lines = fileContent.split('\n');

    // Track code block boundaries and search for imports inside them
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect code block boundaries (``` or ~~~)
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        // Toggle code block state
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // If we're inside a code block, search for imports
      if (inCodeBlock) {
        const importRegex = /@([^\s]+)/g;
        let match;

        while ((match = importRegex.exec(line)) !== null) {
          const importPath = match[1];

          context.report({
            message:
              `Import statement found inside code block: ${importPath}. ` +
              `Imports in code blocks are not processed by Claude Code. ` +
              `Move the import outside of the code block.`,
            line: i + 1,
          });
        }
      }
    }
  },
};
