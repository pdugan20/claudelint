/**
 * Custom rule: normalize-code-fences
 *
 * Ensures all fenced code blocks specify a language identifier.
 * Demonstrates: auto-fix rule with autoFix interface, fixable: true.
 */

import type { Rule } from '../../src/types/rule';
import type { RuleId } from '../../src/rules/rule-ids';

/** Add language to bare opening fences, leaving closing fences unchanged */
function addLanguageToBareFences(content: string): string {
  const lines = content.split('\n');
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    if (inCodeBlock) {
      if (/^```\s*$/.test(lines[i])) {
        inCodeBlock = false;
      }
      continue;
    }

    if (/^```\s*$/.test(lines[i])) {
      lines[i] = '```text';
      inCodeBlock = true;
    } else if (/^```\w/.test(lines[i])) {
      inCodeBlock = true;
    }
  }

  return lines.join('\n');
}

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

    const lines = context.fileContent.split('\n');
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inCodeBlock) {
        // Closing fence
        if (/^```\s*$/.test(line)) {
          inCodeBlock = false;
        }
        continue;
      }

      // Opening fence without language
      if (/^```\s*$/.test(line)) {
        inCodeBlock = true;
        context.report({
          message: 'Code fence missing language identifier',
          line: i + 1,
          fix: 'Add a language (e.g. ```bash, ```typescript, ```text)',
          autoFix: {
            ruleId: 'normalize-code-fences' as RuleId,
            description: 'Add "text" language to bare code fences',
            filePath: context.filePath,
            apply: addLanguageToBareFences,
          },
        });
        // Report once with a single autoFix that fixes all occurrences
        return;
      }

      // Opening fence with language — enter code block
      if (/^```\w/.test(line)) {
        inCodeBlock = true;
      }
    }
  },
};
