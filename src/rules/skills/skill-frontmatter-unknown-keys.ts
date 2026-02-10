/**
 * Rule: skill-frontmatter-unknown-keys
 *
 * Warns when SKILL.md frontmatter contains unrecognized keys.
 * Catches typos and invalid fields that will be silently ignored.
 */

import { Rule, RuleContext } from '../../types/rule';

const KNOWN_KEYS = new Set([
  'name',
  'description',
  'version',
  'tags',
  'dependencies',
  'allowed-tools',
  'disallowed-tools',
  'model',
  'context',
  'agent',
  'argument-hint',
  'disable-model-invocation',
  'user-invocable',
  'hooks',
  'license',
  'compatibility',
  'metadata',
]);

export const rule: Rule = {
  meta: {
    id: 'skill-frontmatter-unknown-keys',
    name: 'Skill Frontmatter Unknown Keys',
    description: 'Unknown key in SKILL.md frontmatter',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.3.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-frontmatter-unknown-keys.md',
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Extract frontmatter
    const frontmatterMatch = fileContent.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return;
    }

    // Parse top-level keys from YAML (simple regex, not full YAML parser)
    // Matches lines that start with a word (not indented = top-level key)
    const keyRegex = /^([a-zA-Z][a-zA-Z0-9_-]*):/gm;
    const frontmatter = frontmatterMatch[1];

    let match;
    while ((match = keyRegex.exec(frontmatter)) !== null) {
      const key = match[1];
      if (!KNOWN_KEYS.has(key)) {
        context.report({
          message:
            `Unknown frontmatter key "${key}". ` +
            `Valid keys: ${[...KNOWN_KEYS].sort().join(', ')}`,
        });
      }
    }
  },
};
