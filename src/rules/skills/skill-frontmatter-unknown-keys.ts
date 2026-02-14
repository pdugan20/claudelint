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
    docs: {
      summary: 'Warns when SKILL.md frontmatter contains unrecognized keys.',
      details:
        'SKILL.md frontmatter supports a specific set of known keys: name, description, version, tags, ' +
        'dependencies, allowed-tools, disallowed-tools, model, context, agent, argument-hint, ' +
        'disable-model-invocation, user-invocable, hooks, license, compatibility, and metadata. ' +
        'This rule detects any top-level keys that are not in this set. Unknown keys are silently ignored ' +
        'at runtime, which means typos in field names (e.g., "dependecies" instead of "dependencies") ' +
        'go unnoticed and the intended configuration never takes effect.',
      examples: {
        incorrect: [
          {
            description: 'Frontmatter with a typo in a key name',
            code: '---\nname: deploy\ndescription: Deploys the application\ndependecies:\n  - build\n---',
          },
          {
            description: 'Frontmatter with a completely unknown key',
            code: '---\nname: deploy\ndescription: Deploys the application\nauthor: Jane Doe\n---',
          },
        ],
        correct: [
          {
            description: 'Frontmatter using only recognized keys',
            code: '---\nname: deploy\ndescription: Deploys the application\ndependencies:\n  - build\nallowed-tools:\n  - Bash\n---',
          },
        ],
      },
      howToFix:
        'Valid keys: name, description, version, tags, dependencies, allowed-tools, ' +
        'disallowed-tools, model, context, agent, argument-hint, disable-model-invocation, ' +
        'user-invocable, hooks, license, compatibility, metadata. ' +
        'Check for typos or place custom data under the `metadata` field.',
      relatedRules: ['skill-description', 'skill-dependencies', 'skill-allowed-tools'],
    },
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
          message: `Unknown frontmatter key: "${key}"`,
        });
      }
    }
  },
};
