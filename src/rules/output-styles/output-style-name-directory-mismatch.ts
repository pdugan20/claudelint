/**
 * Rule: output-style-name-directory-mismatch
 *
 * Validates that output style name in frontmatter matches parent directory name
 *
 * The output style name must match the directory name for proper organization and discovery.
 * This ensures consistency between file structure and output style configuration.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { getParentDirectoryName } from '../../utils/filesystem/paths';
import { isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'output-style-name-directory-mismatch',
    name: 'Output Style Name Directory Mismatch',
    description: 'Output style name must match parent directory name',
    category: 'OutputStyles',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/output-styles/output-style-name-directory-mismatch.md',
    docs: {
      recommended: true,
      summary: 'Ensures the output style name in frontmatter matches its parent directory name.',
      details:
        'This rule checks that the name field in the frontmatter of output style markdown files matches ' +
        'the name of the parent directory. This naming convention is required for proper organization and ' +
        'discovery of output styles. A mismatch means the output style may not be found when referenced ' +
        'by directory name, causing unexpected fallback behavior.',
      examples: {
        incorrect: [
          {
            description:
              'Output style name does not match directory (file at styles/compact/README.md)',
            code: '---\nname: verbose\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Output style name matches directory (file at styles/compact/README.md)',
            code: '---\nname: compact\n---\n\nOutput style content here.',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Either rename the parent directory to match the name in frontmatter, or update the name ' +
        'in frontmatter to match the directory name.',
      relatedRules: [],
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

    const dirName = getParentDirectoryName(filePath);

    if (frontmatter.name !== dirName) {
      context.report({
        message: `Output style name "${frontmatter.name}" does not match directory name "${dirName}"`,
      });
    }
  },
};
