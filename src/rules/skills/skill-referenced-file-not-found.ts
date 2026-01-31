/**
 * Rule: skill-referenced-file-not-found
 *
 * Validates that files referenced in markdown links actually exist
 *
 * Skills may reference other files using relative markdown links like
 * `[documentation](./docs/guide.md)`. This rule ensures those files exist.
 */

import { Rule, RuleContext } from '../../types/rule';
import { fileExists, resolvePath } from '../../utils/file-system';
import { dirname } from 'path';

// Matches relative markdown links: [text](./file.md)
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;

export const rule: Rule = {
  meta: {
    id: 'skill-referenced-file-not-found',
    name: 'Skill Referenced File Not Found',
    description: 'Referenced file in markdown link does not exist',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-referenced-file-not-found.md',
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const skillDir = dirname(filePath);

    // Reset lastIndex since MARKDOWN_LINK_REGEX is a global regex
    MARKDOWN_LINK_REGEX.lastIndex = 0;
    let match;

    while ((match = MARKDOWN_LINK_REGEX.exec(fileContent)) !== null) {
      const [, , referencedPath] = match;
      const fullPath = resolvePath(skillDir, referencedPath);

      const exists = await fileExists(fullPath);
      if (!exists) {
        context.report({
          message: `Referenced file not found: ${referencedPath}`,
        });
      }
    }
  },
};
