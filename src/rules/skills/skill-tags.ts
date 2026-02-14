/**
 * Rule: skill-tags
 *
 * Skill tags must be an array of strings
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.tags for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-tags',
    name: 'Skill Tags Format',
    description: 'Skill tags must be an array of strings',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-tags.md',
    docs: {
      recommended: true,
      summary:
        'Enforces that the `tags` field in SKILL.md frontmatter is a valid array of strings.',
      rationale:
        'A malformed tags field prevents proper categorization and search in skill listings.',
      details:
        'The `tags` frontmatter field helps categorize and discover skills. When present, it must be ' +
        'a YAML array of strings. This rule delegates to the skill frontmatter Zod schema for validation, ' +
        'reporting the first schema violation found. Invalid tag formats prevent proper skill indexing ' +
        'and search functionality.',
      examples: {
        incorrect: [
          {
            description: 'Tags as a single string instead of an array',
            code: '---\nname: deploy-app\ntags: deployment\n---',
          },
          {
            description: 'Tags array containing non-string values',
            code: '---\nname: deploy-app\ntags:\n  - deployment\n  - 123\n---',
          },
        ],
        correct: [
          {
            description: 'Valid tags array',
            code: '---\nname: deploy-app\ntags:\n  - deployment\n  - ci-cd\n  - production\n---',
          },
          {
            description: 'No tags field (tags are optional)',
            code: '---\nname: deploy-app\ndescription: Deploys the application\n---',
          },
        ],
      },
      howToFix:
        'Ensure the `tags` field is a YAML array of strings. Each tag should be on its own line ' +
        'prefixed with `-`. Remove any non-string values from the array.',
      relatedRules: ['skill-name', 'skill-description'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.tags) {
      return;
    }

    const tagsSchema = SkillFrontmatterSchema.shape.tags;
    const result = tagsSchema.safeParse(frontmatter.tags);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'tags');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
