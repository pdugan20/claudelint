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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-reference-not-linked.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Collect all linked references to avoid false positives
    LINKED_BACKTICK_REF.lastIndex = 0;
    const linkedPaths = new Set<string>();
    let linkedMatch;
    while ((linkedMatch = LINKED_BACKTICK_REF.exec(fileContent)) !== null) {
      linkedPaths.add(linkedMatch[0]);
    }

    // Find backtick file references not inside markdown links
    BACKTICK_FILE_REF.lastIndex = 0;
    let match;

    while ((match = BACKTICK_FILE_REF.exec(fileContent)) !== null) {
      const referencedPath = match[1];
      const matchIndex = match.index;

      // Check if preceded by ]( which indicates it's inside a markdown link
      const before = fileContent.substring(Math.max(0, matchIndex - 2), matchIndex);
      if (before.includes('(')) {
        continue;
      }

      const fullMatch = match[0]; // includes backticks
      context.report({
        message:
          `File reference \`${referencedPath}\` should be a markdown link. ` +
          `Use [${referencedPath}](./${referencedPath}) instead.`,
        autoFix: {
          ruleId: 'skill-reference-not-linked',
          description: `Convert \`${referencedPath}\` to markdown link`,
          filePath,
          apply: (content) =>
            content.replace(fullMatch, `[${referencedPath}](./${referencedPath})`),
        },
      });
    }
  },
};
