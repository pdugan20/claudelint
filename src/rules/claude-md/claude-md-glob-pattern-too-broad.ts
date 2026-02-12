/**
 * Rule: claude-md-glob-pattern-too-broad
 *
 * Warns when path patterns in frontmatter are overly broad (** or *).
 * Broad patterns may match unintended files and should be more specific.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

/**
 * Glob pattern too broad validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'claude-md-glob-pattern-too-broad',
    name: 'Glob Pattern Too Broad',
    description: 'Path pattern is overly broad',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-glob-pattern-too-broad.md',
    docs: {
      recommended: true,
      summary:
        'Warns when path patterns in rule file frontmatter are overly broad, matching all files.',
      details:
        'Files in `.claude/rules/` include YAML frontmatter with a `paths` field that controls ' +
        'which files the rule applies to. Using `**` or `*` as a path pattern matches every file ' +
        'in the project, which is almost never the intended behavior for a scoped rule. Overly ' +
        'broad patterns defeat the purpose of file-scoped rules and can cause Claude Code to apply ' +
        'guidelines in contexts where they are not relevant. This rule flags bare `**` and `*` ' +
        'patterns and suggests more specific alternatives.',
      examples: {
        incorrect: [
          {
            description: 'Frontmatter with a catch-all glob pattern',
            code:
              '---\n' +
              'paths:\n' +
              '  - "**"\n' +
              '---\n\n' +
              'These guidelines apply to React components.',
            language: 'markdown',
          },
          {
            description: 'Frontmatter with a single-star catch-all',
            code: '---\n' + 'paths:\n' + '  - "*"\n' + '---\n\n' + 'TypeScript coding standards.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Frontmatter with a specific glob pattern',
            code:
              '---\n' +
              'paths:\n' +
              '  - src/components/**/*.tsx\n' +
              '---\n\n' +
              'These guidelines apply to React components.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Replace the broad pattern with a more specific glob that targets the files the rule ' +
        'should apply to. For example, use `src/**/*.ts` for all TypeScript files or ' +
        '`src/components/**/*.tsx` for React components.',
      whenNotToUse:
        'Disable this rule if you intentionally want a rule file to apply to every file in the ' +
        'project. In that case, consider placing the content in the main CLAUDE.md instead.',
      relatedRules: ['claude-md-glob-pattern-backslash', 'claude-md-paths'],
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

    // Check paths field for overly broad patterns
    if (Array.isArray(frontmatter.paths)) {
      for (const pattern of frontmatter.paths) {
        if (pattern === '**' || pattern === '*') {
          context.report({
            message: `Path pattern is very broad: ${pattern}. Consider being more specific.`,
          });
        }
      }
    }
  },
};
