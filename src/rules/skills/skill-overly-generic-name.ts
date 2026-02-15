/**
 * Rule: skill-overly-generic-name
 *
 * Flags skill names that are too generic to describe functionality.
 * Based on Anthropic Skills Guide p11: "Avoid generic names"
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

/** Generic keywords that should not be used alone as a skill name. */
const GENERIC_KEYWORDS = [
  'helper',
  'util',
  'utils',
  'tool',
  'tools',
  'script',
  'scripts',
  'manager',
  'handler',
  'processor',
  'service',
  'common',
  'shared',
  'main',
  'core',
  'base',
];

/** Single-word verbs that need additional specificity in a skill name. */
const GENERIC_VERBS = [
  'format',
  'validate',
  'test',
  'build',
  'deploy',
  'run',
  'execute',
  'process',
  'handle',
  'manage',
  'create',
  'update',
  'delete',
  'check',
  'analyze',
  'generate',
  'convert',
  'transform',
];

export const rule: Rule = {
  meta: {
    id: 'skill-overly-generic-name',
    name: 'Skill Overly Generic Name',
    description:
      'Skill name should be specific and descriptive, not just generic keywords or single-word verbs',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-overly-generic-name.md',
    docs: {
      recommended: true,
      summary: 'Flags skill names that are too generic to convey what the skill does.',
      rationale:
        'Generic names like "helper" or "utils" provide no clue about functionality, confusing users and the AI.',
      details:
        'Skill names should clearly describe their functionality. Names that consist entirely of ' +
        'generic keywords (e.g., "utils", "helper", "manager") or are single-word verbs (e.g., "build", ' +
        '"deploy", "test") do not communicate the skill\'s purpose. This rule checks for names composed ' +
        'solely of generic keywords like "helper", "util", "tool", "service", "core", or single-word ' +
        'action verbs like "format", "validate", "deploy". Based on the Anthropic Skills Guide ' +
        'recommendation to avoid generic names.',
      examples: {
        incorrect: [
          {
            description: 'Single-word generic verb',
            code: '---\nname: deploy\ndescription: Deploys the application\n---',
          },
          {
            description: 'Name composed only of generic keywords',
            code: '---\nname: helper-utils\ndescription: Helper utilities\n---',
          },
          {
            description: 'Another generic-only name',
            code: '---\nname: tool\ndescription: A useful tool\n---',
          },
        ],
        correct: [
          {
            description: 'Descriptive name indicating what is deployed',
            code: '---\nname: deploy-staging\ndescription: Deploys the application to staging\n---',
          },
          {
            description: 'Specific name with context',
            code: '---\nname: format-sql\ndescription: Formats SQL query files\n---',
          },
        ],
      },
      howToFix:
        'Add descriptive words to the skill name that indicate its specific functionality. ' +
        'For example, change "deploy" to "deploy-staging" or "utils" to "string-utils".',
      relatedRules: ['skill-name', 'skill-name-directory-mismatch', 'skill-description-quality'],
    },
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return; // Field not present - let other rules handle missing fields
    }

    const name = frontmatter.name as string;
    const nameParts = name.split('-');

    // Check if name is only a single generic verb
    if (nameParts.length === 1 && GENERIC_VERBS.includes(nameParts[0].toLowerCase())) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: `Name "${name}" is too generic`,
        line,
      });
      return;
    }

    // Check if name is ONLY generic keywords (no descriptive parts)
    const isOnlyGeneric = nameParts.every((part) => GENERIC_KEYWORDS.includes(part.toLowerCase()));

    if (isOnlyGeneric) {
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: `Name "${name}" is too generic`,
        line,
      });
    }
  },
};
