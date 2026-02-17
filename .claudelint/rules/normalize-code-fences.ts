/**
 * Custom rule: normalize-code-fences
 *
 * Ensures all fenced code blocks specify a language identifier.
 * Demonstrates: auto-fix rule with autoFix interface, fixable: true.
 */

import type { Rule } from '../../src/types/rule';
import type { RuleId } from '../../src/rules/rule-ids';

export const rule: Rule = {
  meta: {
    id: 'normalize-code-fences',
    name: 'Normalize Code Fences',
    description: 'Fenced code blocks must specify a language',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: true,
    since: '1.0.0',
  },

  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) {
      return;
    }

    const { fileContent, filePath } = context;
    const lines = fileContent.split('\n');
    let inCodeBlock = false;
    let offset = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inCodeBlock) {
        if (/^```\s*$/.test(line)) {
          inCodeBlock = false;
        }
        offset += line.length + 1;
        continue;
      }

      if (/^```\s*$/.test(line)) {
        inCodeBlock = true;
        const fenceStart = offset;
        const fenceEnd = offset + line.trimEnd().length;
        context.report({
          message: 'Code fence missing language identifier',
          line: i + 1,
          fix: 'Add a language (e.g. ```bash, ```typescript, ```text)',
          autoFix: {
            ruleId: 'normalize-code-fences' as RuleId,
            description: 'Add "text" language to bare code fence',
            filePath,
            range: [fenceStart, fenceEnd] as [number, number],
            text: '```text',
          },
        });
      } else if (/^```\w/.test(line)) {
        inCodeBlock = true;
      }

      offset += line.length + 1;
    }
  },
};
