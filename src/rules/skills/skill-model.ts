/**
 * Rule: skill-model
 *
 * Skill model must be one of: sonnet, opus, haiku, inherit
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.model for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-model',
    name: 'Skill Model Value',
    description: 'Skill model must be one of: sonnet, opus, haiku, inherit',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-model.md',
    docs: {
      recommended: true,
      summary:
        'Enforces that the `model` field in SKILL.md frontmatter is one of the allowed values.',
      details:
        'The `model` frontmatter field controls which Claude model executes the skill. ' +
        'Only a fixed set of values is valid: `sonnet`, `opus`, `haiku`, or `inherit`. ' +
        'An invalid model value will cause the skill to fail at runtime. This rule validates ' +
        'the field against the allowed values defined in the skill frontmatter schema.',
      examples: {
        incorrect: [
          {
            description: 'Invalid model value',
            code: '---\nname: deploy-app\nmodel: gpt-4\n---',
          },
          {
            description: 'Misspelled model name',
            code: '---\nname: deploy-app\nmodel: sonnett\n---',
          },
        ],
        correct: [
          {
            description: 'Valid model: sonnet',
            code: '---\nname: deploy-app\nmodel: sonnet\n---',
          },
          {
            description: 'Valid model: inherit (uses parent context model)',
            code: '---\nname: deploy-app\nmodel: inherit\n---',
          },
        ],
      },
      howToFix:
        'Set the `model` field to one of the allowed values: `sonnet`, `opus`, `haiku`, or `inherit`. ' +
        'If you do not need to specify a model, remove the field entirely since it is optional.',
      relatedRules: ['skill-name', 'skill-version'],
    },
  },
  validate: (context: RuleContext) => {
    // Extract frontmatter
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.model) {
      return; // Field not present - model is optional
    }

    // Delegate to Zod schema validator for 'model' field
    const modelSchema = SkillFrontmatterSchema.shape.model;
    const result = modelSchema.safeParse(frontmatter.model);

    if (!result.success) {
      // Report first error with proper context
      const line = getFrontmatterFieldLine(context.fileContent, 'model');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
