/**
 * Rule: skill-model
 *
 * Skill model must be a string
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
    description: 'Skill model must be a string',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-model',
    docs: {
      recommended: true,
      summary: 'Checks that the `model` field in SKILL.md frontmatter is a string.',
      rationale:
        'Claude Code accepts model aliases and full model identifiers; non-string values are invalid.',
      details:
        'The `model` frontmatter field controls which Claude model executes the skill. ' +
        'Use a model alias such as `sonnet`, a full model identifier, or `inherit`. ' +
        'Available models depend on the account and provider. This rule validates ' +
        'the value type without rejecting custom model identifiers.',
      examples: {
        incorrect: [
          {
            description: 'Numeric model value',
            code: '---\nname: deploy-app\nmodel: 42\n---',
          },
          {
            description: 'List instead of a model identifier',
            code: '---\nname: deploy-app\nmodel: [sonnet, opus]\n---',
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
        'Set `model` to a string containing a model alias, full identifier, or `inherit`. ' +
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
