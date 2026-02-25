/**
 * Rule: skill-frontmatter-unknown-keys
 *
 * Warns when SKILL.md frontmatter contains unrecognized keys.
 * Catches typos and invalid fields that will be silently ignored.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';

const KNOWN_KEYS = new Set([
  'name',
  'description',
  'version',
  'tags',
  'allowed-tools',
  'model',
  'context',
  'agent',
  'argument-hint',
  'disable-model-invocation',
  'user-invocable',
  'hooks',
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
    docUrl: 'https://claudelint.com/rules/skills/skill-frontmatter-unknown-keys',
    docs: {
      strict: true,
      summary: 'Warns when SKILL.md frontmatter contains unrecognized keys.',
      rationale:
        'Unknown keys are silently ignored, which often indicates a typo in a valid key name.',
      details:
        'SKILL.md frontmatter supports a specific set of known keys: name, description, version, tags, ' +
        'allowed-tools, model, context, agent, argument-hint, disable-model-invocation, user-invocable, ' +
        'and hooks. This rule detects any top-level keys that are not in this set. Unknown keys are ' +
        'silently ignored at runtime, which means typos in field names go unnoticed and the intended ' +
        'configuration never takes effect.',
      examples: {
        incorrect: [
          {
            description: 'Frontmatter with a typo in a key name',
            code: '---\nname: deploy\ndescription: Deploys the application\ncontxt: fork\n---',
          },
          {
            description: 'Frontmatter with a completely unknown key',
            code: '---\nname: deploy\ndescription: Deploys the application\nauthor: Jane Doe\n---',
          },
        ],
        correct: [
          {
            description: 'Frontmatter using only recognized keys',
            code: '---\nname: deploy\ndescription: Deploys the application\nallowed-tools:\n  - Bash\n---',
          },
        ],
      },
      howToFix:
        'Valid keys: name, description, version, tags, allowed-tools, model, context, agent, ' +
        'argument-hint, disable-model-invocation, user-invocable, hooks. ' +
        'Check for typos in your field names.',
      relatedRules: ['skill-description', 'skill-allowed-tools'],
    },
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Use shared utility backed by js-yaml for proper YAML parsing
    const { frontmatter } = extractFrontmatter(fileContent);
    if (!frontmatter || typeof frontmatter !== 'object') {
      return;
    }

    for (const key of Object.keys(frontmatter)) {
      if (!KNOWN_KEYS.has(key)) {
        context.report({
          message: `Unknown frontmatter key: "${key}"`,
        });
      }
    }
  },
};
