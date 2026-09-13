/**
 * Rule: output-style-name-directory-mismatch
 *
 * Checks the naming convention of legacy directory-per-style layouts.
 * Flat output styles allow an explicit frontmatter name to override the filename.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { getOutputStyleName, isFlatOutputStyle } from '../../utils/filesystem/paths';
import { isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'output-style-name-directory-mismatch',
    name: 'Output Style Name Directory Mismatch',
    description: 'Legacy output style name must match its directory',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/output-styles/output-style-name-directory-mismatch',
    docs: {
      recommended: false,
      summary: 'Checks name consistency in legacy directory-per-style layouts.',
      rationale: 'This optional convention keeps legacy directory-per-style trees consistent.',
      details:
        'Claude Code output styles are flat markdown files. An explicit frontmatter `name` ' +
        'overrides the filename and does not need to match it. This rule skips flat styles. ' +
        'For compatibility, it still checks names in legacy directory-per-style layouts. ' +
        'It is not included in the recommended preset.',
      examples: {
        incorrect: [
          {
            description:
              'Legacy output style name differs from its directory (file at output-styles/compact/style.md)',
            code: '---\nname: verbose\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description:
              'Flat output styles may override the filename (file at output-styles/compact.md)',
            code: '---\nname: Diagrams first\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Use a flat file in output-styles/ with any frontmatter name. For a legacy nested ' +
        'layout, align the name with its containing directory or disable this convention rule.',
      relatedRules: ['output-style-body-too-short', 'output-style-missing-guidelines'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate .md files (output style files)
    if (!filePath.endsWith('.md') || isFlatOutputStyle(filePath)) {
      return;
    }

    const { frontmatter } = extractFrontmatter(fileContent);

    if (!frontmatter || !frontmatter.name || !isString(frontmatter.name)) {
      return; // Missing name handled by output-style-name rule
    }

    const pathName = getOutputStyleName(filePath);

    if (frontmatter.name !== pathName) {
      context.report({
        message: `Output style name "${frontmatter.name}" does not match directory name "${pathName}"`,
      });
    }
  },
};
