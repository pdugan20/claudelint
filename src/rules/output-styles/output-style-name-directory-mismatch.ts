/**
 * Rule: output-style-name-directory-mismatch
 *
 * Validates that the output style name in frontmatter matches the name its path implies.
 *
 * Output styles are flat files whose filename is the style name, so `name` is compared with
 * the filename. In a directory-per-style layout the containing directory supplies the name
 * instead, and that is what `name` is compared with.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { getOutputStyleName, isFlatOutputStyle } from '../../utils/filesystem/paths';
import { isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'output-style-name-directory-mismatch',
    name: 'Output Style Name Directory Mismatch',
    description: 'Output style name must match the name its path implies',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/output-styles/output-style-name-directory-mismatch',
    docs: {
      recommended: true,
      summary: 'Ensures the output style name in frontmatter matches the name implied by its path.',
      rationale:
        'The filename is the fallback style name, so a disagreeing `name` makes it ambiguous which style a file defines.',
      details:
        'Output styles are flat markdown files, and the filename becomes the style name unless the ' +
        'frontmatter sets `name`. This rule checks that an explicit `name` agrees with the filename, ' +
        'so a file cannot appear to define one style while registering another. In a ' +
        'directory-per-style layout the containing directory supplies the name instead, and `name` is ' +
        'compared with that.',
      examples: {
        incorrect: [
          {
            description:
              'Output style name does not match its filename (file at .claude/output-styles/compact.md)',
            code: '---\nname: verbose\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description:
              'Output style name matches its filename (file at .claude/output-styles/compact.md)',
            code: '---\nname: compact\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Either rename the file to match the name in frontmatter, or update the name in frontmatter ' +
        'to match the filename. Omitting `name` entirely is also valid — the filename supplies it.',
      relatedRules: ['output-style-body-too-short', 'output-style-missing-guidelines'],
    },
  },
  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate .md files (output style files)
    if (!filePath.endsWith('.md')) {
      return;
    }

    const { frontmatter } = extractFrontmatter(fileContent);

    if (!frontmatter || !frontmatter.name || !isString(frontmatter.name)) {
      return; // Missing name handled by output-style-name rule
    }

    const pathName = getOutputStyleName(filePath);

    if (frontmatter.name !== pathName) {
      const source = isFlatOutputStyle(filePath) ? 'file name' : 'directory name';

      context.report({
        message: `Output style name "${frontmatter.name}" does not match ${source} "${pathName}"`,
      });
    }
  },
};
