/**
 * Rule: skill-referenced-file-not-found
 *
 * Validates that files referenced in markdown links actually exist
 *
 * Skills may reference other files using relative markdown links like
 * `[documentation](./docs/guide.md)`. This rule ensures those files exist.
 */

import { Rule, RuleContext } from '../../types/rule';
import { fileExists, resolvePath } from '../../utils/filesystem/files';
import { dirname } from 'path';

// Matches relative markdown links: [text](./file.md) or [text](file.md)
// Excludes URLs, anchors, absolute paths, and mailto links
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((?!https?:\/\/|#|\/|mailto:)(?:\.\/)?([^)]+)\)/g;

export const rule: Rule = {
  meta: {
    id: 'skill-referenced-file-not-found',
    name: 'Skill Referenced File Not Found',
    description: 'Referenced file in markdown link does not exist',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-referenced-file-not-found',
    docs: {
      recommended: true,
      summary:
        'Errors when a relative markdown link in SKILL.md points to a file that does not exist.',
      rationale:
        'Broken file links cause runtime errors when the skill tries to reference non-existent resources.',
      details:
        'Skills may reference supporting files using relative markdown links like ' +
        '`[guide](./docs/guide.md)`. If those files are missing, the skill documentation is broken. ' +
        'This rule extracts all relative markdown links from SKILL.md (excluding URLs, anchors, ' +
        'absolute paths, and mailto links) and checks whether each referenced file exists on disk. ' +
        'Missing files indicate stale references that should be updated or removed.',
      examples: {
        incorrect: [
          {
            description: 'Link to a file that does not exist',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'See [setup guide](./docs/setup.md) for instructions.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'Link to an existing file',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'See [setup guide](./docs/setup.md) for instructions.\n\n' +
              '<!-- docs/setup.md exists on disk -->',
            language: 'markdown',
          },
          {
            description: 'External links are not checked',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'See [the docs](https://example.com/docs) for details.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Verify that the referenced file exists at the specified path relative to the SKILL.md file. ' +
        'If the file was moved, update the link. If it was removed, delete the link.',
      relatedRules: ['skill-reference-not-linked'],
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const skillDir = dirname(filePath);

    for (const match of fileContent.matchAll(MARKDOWN_LINK_REGEX)) {
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
