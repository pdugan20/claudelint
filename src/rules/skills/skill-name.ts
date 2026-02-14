/**
 * Rule: skill-name
 *
 * Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.name for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-name',
    name: 'Skill Name Format',
    description:
      'Skill name must be lowercase-with-hyphens, under 64 characters, with no XML tags or reserved words',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-name.md',
    docs: {
      recommended: true,
      summary:
        'Enforces that skill names use lowercase-with-hyphens format and are under 64 characters.',
      rationale:
        'Non-standard names break URL generation, directory lookups, and cross-referencing between skills.',
      details:
        'Skill names serve as identifiers throughout the Claude Code ecosystem. ' +
        'This rule validates that the `name` field in SKILL.md frontmatter follows a strict format: ' +
        'lowercase letters and hyphens only, no longer than 64 characters, and free of XML tags or reserved words. ' +
        'Consistent naming prevents conflicts and ensures skills are discoverable and portable across projects.',
      examples: {
        incorrect: [
          {
            description: 'Name with uppercase letters',
            code: '---\nname: My-Skill\n---',
            language: 'yaml',
          },
          {
            description: 'Name with spaces',
            code: '---\nname: my skill name\n---',
            language: 'yaml',
          },
          {
            description: 'Name exceeding 64 characters',
            code: '---\nname: this-is-an-extremely-long-skill-name-that-exceeds-the-sixty-four-character-limit\n---',
            language: 'yaml',
          },
        ],
        correct: [
          {
            description: 'Valid lowercase hyphenated name',
            code: '---\nname: deploy-to-staging\n---',
            language: 'yaml',
          },
          {
            description: 'Short single-word name',
            code: '---\nname: lint\n---',
            language: 'yaml',
          },
        ],
      },
      howToFix:
        'Rename the skill to use only lowercase letters and hyphens. ' +
        'Remove any uppercase letters, spaces, underscores, or special characters. ' +
        'Ensure the name is under 64 characters.',
      relatedRules: ['skill-name-directory-mismatch', 'skill-description'],
    },
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.name) {
      return; // Field not present - let other rules handle missing fields
    }

    // Delegate to Zod schema validator for 'name' field
    const nameSchema = SkillFrontmatterSchema.shape.name;
    const result = nameSchema.safeParse(frontmatter.name);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'name');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
