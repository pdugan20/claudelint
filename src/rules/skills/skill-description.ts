/**
 * Rule: skill-description
 *
 * Skill description must be at least 10 characters, written in third person, with no XML tags
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.description for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-description',
    name: 'Skill Description Format',
    description:
      'Skill description must be at least 10 characters, written in third person, with no XML tags',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-description',
    docs: {
      recommended: true,
      summary: 'Enforces that skills have a valid description in their SKILL.md frontmatter.',
      rationale:
        "Without a description, Claude Code cannot determine the skill's purpose or when to suggest it.",
      details:
        'Every skill should include a meaningful description so users and Claude understand its purpose. ' +
        'This rule validates that the `description` field in SKILL.md frontmatter is present, at least 10 characters long, ' +
        'written in third person, and free of XML tags. ' +
        'A good description improves discoverability and helps users decide whether a skill fits their needs.',
      examples: {
        incorrect: [
          {
            description: 'Description too short',
            code: '---\nname: deploy\ndescription: Deploys\n---',
            language: 'yaml',
          },
          {
            description: 'Description with XML tags',
            code: '---\nname: deploy\ndescription: <b>Deploys the app</b> to production\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Clear third-person description',
            code: '---\nname: deploy\ndescription: Deploys the application to the staging environment\n---',
            language: 'yaml',
          },
          {
            description: 'Detailed description',
            code: '---\nname: test-runner\ndescription: Runs the full test suite and reports coverage metrics\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Add or update the `description` field in your SKILL.md frontmatter. ' +
        'Use at least 10 characters, write in third person (e.g., "Deploys the app" not "I deploy the app"), ' +
        'and avoid HTML or XML markup.',
      relatedRules: ['skill-name', 'skill-description-quality'],
    },
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.description) {
      return; // Field not present - let other rules handle missing fields
    }

    // Delegate to Zod schema validator for 'description' field
    const descriptionSchema = SkillFrontmatterSchema.shape.description;
    const result = descriptionSchema.safeParse(frontmatter.description);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'description');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
