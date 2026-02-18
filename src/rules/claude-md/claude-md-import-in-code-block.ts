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
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/claude-md/claude-md-import-in-code-block',
    docs: {
      recommended: true,
      summary:
        'Errors when @import statements appear inside fenced code blocks where they are not processed.',
      rationale:
        'Imports inside code fences are treated as literal text and silently ignored, leaving instructions incomplete.',
      details:
        'Claude Code processes `@import` directives to include content from other files. However, ' +
        'when an `@import` appears inside a fenced code block (``` or ~~~), it is treated as ' +
        'literal text and will not be resolved. This is almost always a mistake -- the author ' +
        'intended the import to be active but accidentally placed it inside a code fence. This ' +
        'rule scans for `@` references inside code blocks and reports them so the import can be ' +
        'moved outside the fence.',
      examples: {
        incorrect: [
          {
            description: 'An @import inside a fenced code block (will not be processed)',
            code:
              '# CLAUDE.md\n\n' + '```markdown\n' + '@import .claude/rules/testing.md\n' + '```',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'An @import outside of code blocks (will be processed)',
            code: '# CLAUDE.md\n\n' + '@import .claude/rules/testing.md',
            language: 'markdown',
          },
          {
            description: 'Documenting import syntax in a code block with explanatory text',
            code:
              '# CLAUDE.md\n\n' +
              '@import .claude/rules/testing.md\n\n' +
              'Import syntax example:\n\n' +
              '```text\n' +
              '# This is just documentation, not an active import\n' +
              '```',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Move the `@import` directive outside of the code block. If the import is inside a code ' +
        'block as documentation or an example, this is a false positive and the warning can be ' +
        'ignored.',
      whenNotToUse:
        'Disable this rule if your CLAUDE.md includes code block examples that intentionally ' +
        'show import syntax for documentation purposes.',
      relatedRules: ['claude-md-import-missing', 'claude-md-import-circular'],
    },
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
            message: `Import inside code block: ${importPath}`,
            line: i + 1,
          });
        }
      }
    }
  },
};
