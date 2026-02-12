/**
 * Rule: claude-md-glob-pattern-backslash
 *
 * Warns when path patterns in frontmatter use backslashes instead of forward slashes.
 * Path patterns should always use forward slashes, even on Windows.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

/**
 * Glob pattern backslash validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-glob-pattern-backslash',
    name: 'Glob Pattern Backslash',
    description: 'Path pattern uses backslashes instead of forward slashes',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-glob-pattern-backslash.md',
    docs: {
      recommended: true,
      summary:
        'Warns when path patterns in rule file frontmatter use backslashes instead of forward slashes.',
      details:
        'Files in `.claude/rules/` can include YAML frontmatter with a `paths` field that specifies ' +
        'glob patterns for when the rule should apply. Glob patterns should always use forward ' +
        'slashes (`/`) as path separators, even on Windows. Backslashes (`\\`) are treated as ' +
        'escape characters by most glob implementations and will not match paths correctly on ' +
        'macOS or Linux. This rule inspects the `paths` array in frontmatter and reports any ' +
        'pattern that contains a backslash.',
      examples: {
        incorrect: [
          {
            description: 'Frontmatter path pattern using backslashes',
            code:
              '---\n' +
              'paths:\n' +
              '  - src\\components\\**\\*.tsx\n' +
              '---\n\n' +
              'Component guidelines here.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Frontmatter path pattern using forward slashes',
            code:
              '---\n' +
              'paths:\n' +
              '  - src/components/**/*.tsx\n' +
              '---\n\n' +
              'Component guidelines here.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Replace all backslashes (`\\`) with forward slashes (`/`) in the `paths` array of your ' +
        'rule file frontmatter. Forward slashes work correctly on all operating systems.',
      whenNotToUse:
        'There is no reason to disable this rule. Backslashes in glob patterns are always incorrect.',
      relatedRules: ['claude-md-glob-pattern-too-broad', 'claude-md-paths'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check files in .claude/rules/ directory (rules files with frontmatter)
    if (!filePath.includes('.claude/rules/')) {
      return;
    }

    // Parse frontmatter
    const { frontmatter } = extractFrontmatter(fileContent);
    if (!frontmatter) {
      return;
    }

    // Check paths field for backslashes
    if (Array.isArray(frontmatter.paths)) {
      for (const pattern of frontmatter.paths) {
        if (typeof pattern === 'string' && pattern.includes('\\')) {
          context.report({
            message: `Path pattern uses backslashes: ${pattern}. Use forward slashes even on Windows.`,
          });
        }
      }
    }
  },
};
