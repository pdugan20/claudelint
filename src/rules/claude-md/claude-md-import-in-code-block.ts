/**
 * Rule: claude-md-import-in-code-block
 *
 * Errors when import statements are found inside fenced code blocks.
 * Imports in code blocks are not processed by Claude Code and will be ignored.
 */

import { Rule } from '../../types/rule';
import { extractImportsWithLineNumbers } from '../../utils/formats/markdown';

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

    // Find all fenced code blocks (``` or ~~~)
    const fencedBlockRegex = /^```[\s\S]*?^```|^~~~[\s\S]*?^~~~/gm;
    const codeBlocks: Array<{ start: number; end: number }> = [];

    let match;
    while ((match = fencedBlockRegex.exec(fileContent)) !== null) {
      codeBlocks.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Check if any imports fall within code blocks
    const imports = extractImportsWithLineNumbers(fileContent);

    for (const importInfo of imports) {
      // Calculate the character position of this import
      const lines = fileContent.split('\n');
      let charPos = 0;
      for (let i = 0; i < importInfo.line - 1; i++) {
        charPos += lines[i].length + 1; // +1 for newline
      }

      // Check if this import is inside any code block
      for (const block of codeBlocks) {
        if (charPos >= block.start && charPos <= block.end) {
          context.report({
            message:
              `Import statement found inside code block: ${importInfo.path}. ` +
              `Imports in code blocks are not processed by Claude Code. ` +
              `Move the import outside of the code block.`,
            line: importInfo.line,
          });
          break;
        }
      }
    }
  },
};
