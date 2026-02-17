/**
 * Rule: skill-reference-not-linked
 *
 * Warns when SKILL.md contains backtick-enclosed file paths that reference
 * skill supporting directories (references/, examples/, scripts/, templates/)
 * but are not formatted as markdown links. Plain-text references prevent
 * the skill-referenced-file-not-found rule from validating them.
 */

import { Rule } from '../../types/rule';

// Matches backtick-enclosed paths to skill supporting directories
const BACKTICK_FILE_REF = /`((?:references|examples|scripts|templates)\/[^`]+\.[a-zA-Z]+)`/g;

// Matches markdown link containing a backtick path: [text](`path`)
const LINKED_BACKTICK_REF =
  /\[[^\]]*\]\([^)]*(?:references|examples|scripts|templates)\/[^)]+\.[a-zA-Z]+[^)]*\)/g;

export const rule: Rule = {
  meta: {
    id: 'skill-reference-not-linked',
    name: 'Skill Reference Not Linked',
    description: 'File reference in backticks should be a markdown link',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-reference-not-linked.md',
    docs: {
      summary:
        'Warns when backtick-enclosed file paths in SKILL.md are not formatted as markdown links.',
      rationale:
        'Unlinked file references cannot be navigated and may become stale without detection.',
      details:
        'SKILL.md files often reference supporting files in directories like `references/`, `examples/`, ' +
        '`scripts/`, and `templates/`. When these paths appear in backticks (e.g., `references/guide.md`) ' +
        'but are not proper markdown links, the `skill-referenced-file-not-found` rule cannot validate ' +
        'that the files exist. This rule detects backtick-enclosed file paths targeting those directories ' +
        'and suggests converting them to markdown links. It provides an auto-fix that converts the ' +
        'backtick reference to `[path](./path)` format.',
      examples: {
        incorrect: [
          {
            description: 'File reference in backticks without a markdown link',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'See `references/deploy-guide.md` for details.',
            language: 'markdown',
          },
        ],
        correct: [
          {
            description: 'File reference as a proper markdown link',
            code:
              '---\nname: deploy-app\ndescription: Deploys the application\n---\n\n' +
              'See [references/deploy-guide.md](./references/deploy-guide.md) for details.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'Convert backtick-enclosed file paths to markdown links. For example, change ' +
        '`references/guide.md` to `[references/guide.md](./references/guide.md)`. ' +
        'The auto-fixer will perform this conversion automatically.',
      relatedRules: ['skill-referenced-file-not-found'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Collect all linked references to avoid false positives
    const linkedPaths = new Set<string>();
    for (const linkedMatch of fileContent.matchAll(LINKED_BACKTICK_REF)) {
      linkedPaths.add(linkedMatch[0]);
    }

    // Find backtick file references not inside markdown links
    for (const match of fileContent.matchAll(BACKTICK_FILE_REF)) {
      const referencedPath = match[1];
      const matchIndex = match.index;

      // Check if preceded by ]( which indicates it's inside a markdown link
      const before = fileContent.substring(Math.max(0, matchIndex - 2), matchIndex);
      if (before.includes('(')) {
        continue;
      }

      const fullMatch = match[0]; // includes backticks
      context.report({
        message: `File reference \`${referencedPath}\` not linked`,
        autoFix: {
          ruleId: 'skill-reference-not-linked',
          description: `Convert \`${referencedPath}\` to markdown link`,
          filePath,
          range: [matchIndex, matchIndex + fullMatch.length],
          text: `[${referencedPath}](./${referencedPath})`,
        },
      });
    }
  },
};
