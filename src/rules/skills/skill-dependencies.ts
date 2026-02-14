/**
 * Rule: skill-dependencies
 *
 * Skill dependencies must be an array of strings
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.dependencies for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-dependencies',
    name: 'Skill Dependencies Format',
    description: 'Skill dependencies must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-dependencies.md',
    docs: {
      recommended: true,
      summary:
        'Validates that the dependencies field in SKILL.md frontmatter is a proper array of strings.',
      rationale:
        'A malformed dependencies field prevents proper dependency resolution and skill loading order.',
      details:
        'The `dependencies` field declares other skills or packages that this skill depends on. ' +
        'It must be a YAML array of strings. Malformed values (e.g., a single string, a number, or nested objects) ' +
        'will cause runtime errors when the system tries to resolve dependencies. ' +
        'This rule delegates to the Zod schema for validation.',
      examples: {
        incorrect: [
          {
            description: 'Dependencies as a single string instead of an array',
            code: '---\nname: deploy\ndescription: Deploys the application\ndependencies: build\n---',
          },
          {
            description: 'Dependencies with non-string entries',
            code: '---\nname: deploy\ndescription: Deploys the application\ndependencies:\n  - 123\n  - true\n---',
          },
        ],
        correct: [
          {
            description: 'Valid dependencies array',
            code: '---\nname: deploy\ndescription: Deploys the application\ndependencies:\n  - build\n  - test\n---',
          },
          {
            description: 'No dependencies field (optional)',
            code: '---\nname: lint\ndescription: Runs linting checks\n---',
          },
        ],
      },
      howToFix:
        'Ensure the `dependencies` field is a YAML array where each entry is a string representing ' +
        'a skill name or package identifier.',
      relatedRules: ['skill-cross-reference-invalid'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.dependencies) {
      return;
    }

    const dependenciesSchema = SkillFrontmatterSchema.shape.dependencies;
    const result = dependenciesSchema.safeParse(frontmatter.dependencies);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'dependencies');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
