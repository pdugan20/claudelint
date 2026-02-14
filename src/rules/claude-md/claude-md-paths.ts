/**
 * Rule: claude-md-paths
 *
 * Claude MD paths must be a non-empty array with at least one path pattern.
 * This rule only validates .claude/rules/*.md files which require frontmatter.
 */

import { Rule } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'claude-md-paths',
    name: 'Claude MD Paths Format',
    description: 'Claude MD paths must be a non-empty array with at least one path pattern',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-paths.md',
    docs: {
      recommended: true,
      summary:
        'Validates that the `paths` field in rule file frontmatter is a non-empty array of strings.',
      rationale:
        'An invalid paths field prevents the rule from matching any files, silently disabling the scoped rule.',
      details:
        'Rule files in `.claude/rules/` use YAML frontmatter to declare which file paths the rule ' +
        'applies to via the `paths` field. When present, this field must be a non-empty array ' +
        'where each element is a non-empty string (typically a glob pattern). This rule checks ' +
        'three conditions: (1) `paths` must be an array, not a string or other type; (2) the ' +
        'array must contain at least one entry; (3) each entry must be a non-empty string. If ' +
        '`paths` is not present at all, the rule passes silently since paths are optional in ' +
        'some configurations.',
      examples: {
        incorrect: [
          {
            description: 'Paths as a string instead of an array',
            code: '---\n' + 'paths: src/**/*.ts\n' + '---\n\n' + 'TypeScript coding standards.',
            language: 'markdown',
          },
          {
            description: 'Empty paths array',
            code: '---\n' + 'paths: []\n' + '---\n\n' + 'These guidelines apply to nothing.',
            language: 'markdown',
          },
          {
            description: 'Paths array with an empty string',
            code: '---\n' + 'paths:\n' + '  - ""\n' + '---\n\n' + 'Guidelines with invalid path.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Paths as a properly formatted array',
            code:
              '---\n' +
              'paths:\n' +
              '  - src/**/*.ts\n' +
              '  - src/**/*.tsx\n' +
              '---\n\n' +
              'TypeScript coding standards.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Ensure the `paths` field in your frontmatter is a YAML array with at least one ' +
        'non-empty string entry. Each entry should be a valid glob pattern describing the files ' +
        'the rule applies to.',
      whenNotToUse:
        'There is no reason to disable this rule. Malformed paths always indicate a configuration ' +
        'error that should be corrected.',
      relatedRules: ['claude-md-glob-pattern-backslash', 'claude-md-glob-pattern-too-broad'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate .claude/rules/*.md files
    if (!filePath.includes('.claude/rules/')) {
      return;
    }

    // Parse frontmatter
    const { frontmatter } = extractFrontmatter<{ paths?: unknown }>(fileContent);
    if (!frontmatter) {
      return; // No frontmatter or parse errors handled elsewhere
    }

    // Check if paths field exists
    if (!frontmatter.paths) {
      return; // Missing paths is optional in some cases
    }

    // Validate paths is a non-empty array
    if (!Array.isArray(frontmatter.paths)) {
      context.report({
        message: 'Paths field must be an array',
      });
      return;
    }

    if (frontmatter.paths.length === 0) {
      context.report({
        message: 'Paths array must contain at least one path pattern',
      });
      return;
    }

    // Validate each path is a non-empty string
    for (const [index, path] of frontmatter.paths.entries()) {
      if (typeof path !== 'string') {
        context.report({
          message: `Path at index ${index} must be a string`,
        });
      } else if (path.trim().length === 0) {
        context.report({
          message: `Path at index ${index} cannot be empty`,
        });
      }
    }
  },
};
