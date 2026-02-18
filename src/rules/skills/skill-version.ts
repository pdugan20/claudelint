/**
 * Rule: skill-version
 *
 * Skill version must follow semantic versioning format (e.g., 1.0.0)
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.version for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-version',
    name: 'Skill Version Format',
    description: 'Skill version must follow semantic versioning format (e.g., 1.0.0)',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-version',
    docs: {
      recommended: true,
      summary:
        'Enforces that the `version` field in SKILL.md frontmatter follows semantic versioning.',
      rationale:
        'Non-semver versions break automated version comparison and dependency resolution.',
      details:
        "The `version` frontmatter field communicates the skill's release state to users. When present, " +
        'it must follow semantic versioning format (e.g., `1.0.0`, `0.3.1`). This rule delegates to ' +
        'the skill frontmatter Zod schema for validation. Invalid version strings prevent proper ' +
        'version tracking and dependency resolution. The field is optional; this rule only fires ' +
        'when it is present but malformed.',
      examples: {
        incorrect: [
          {
            description: 'Version missing patch number',
            code: '---\nname: deploy-app\nversion: 1.0\n---',
          },
          {
            description: 'Version with non-numeric components',
            code: '---\nname: deploy-app\nversion: v1.0.0\n---',
          },
          {
            description: 'Arbitrary string as version',
            code: '---\nname: deploy-app\nversion: latest\n---',
          },
        ],
        correct: [
          {
            description: 'Standard semantic version',
            code: '---\nname: deploy-app\nversion: 1.0.0\n---',
          },
          {
            description: 'Pre-release semantic version',
            code: '---\nname: deploy-app\nversion: 0.3.1\n---',
          },
          {
            description: 'No version field (version is optional)',
            code: '---\nname: deploy-app\ndescription: Deploys the application\n---',
          },
        ],
      },
      howToFix:
        'Set the `version` field to a valid semantic version string in `MAJOR.MINOR.PATCH` format ' +
        '(e.g., `1.0.0`). Do not include a "v" prefix or use partial version numbers.',
      relatedRules: ['skill-name', 'skill-model'],
    },
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.version) {
      return; // Field not present or optional - version is optional
    }

    // Delegate to Zod schema validator for 'version' field
    const versionSchema = SkillFrontmatterSchema.shape.version;
    const result = versionSchema.safeParse(frontmatter.version);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'version');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
