/**
 * Rule: skill-context
 *
 * Skill context must be one of: fork, inline, auto
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterSchema.shape.context for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterSchema } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-context',
    name: 'Skill Context Mode',
    description: 'Skill context must be one of: fork, inline, auto',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-context',
    docs: {
      recommended: true,
      summary: 'Validates that the context field in SKILL.md frontmatter uses a valid mode.',
      rationale:
        'An invalid context mode causes a runtime error when Claude Code tries to execute the skill.',
      details:
        'The `context` field controls how a skill is executed. It must be one of the recognized modes: ' +
        '`fork` (runs in a separate agent process), `inline` (runs in the current conversation context), ' +
        'or `auto` (lets the system decide). Any other value is invalid and will cause the skill to fail ' +
        'at runtime. This rule delegates to the Zod schema for validation.',
      examples: {
        incorrect: [
          {
            description: 'Invalid context value',
            code: '---\nname: deploy\ndescription: Deploys the application\ncontext: background\n---',
          },
          {
            description: 'Misspelled context value',
            code: '---\nname: deploy\ndescription: Deploys the application\ncontext: forked\n---',
          },
        ],
        correct: [
          {
            description: 'Using fork context',
            code: '---\nname: deploy\ndescription: Deploys the application\ncontext: fork\nagent: deploy-agent\n---',
          },
          {
            description: 'Using inline context',
            code: '---\nname: lint\ndescription: Runs linting checks\ncontext: inline\n---',
          },
          {
            description: 'Using auto context',
            code: '---\nname: test\ndescription: Runs tests\ncontext: auto\n---',
          },
        ],
      },
      howToFix:
        'Set the `context` field to one of the valid values: `fork`, `inline`, or `auto`. ' +
        'Use `fork` when the skill needs its own agent, `inline` when it should run in the current context, ' +
        'or `auto` to let the system choose.',
      relatedRules: ['skill-agent'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.context) {
      return;
    }

    const contextSchema = SkillFrontmatterSchema.shape.context;
    const result = contextSchema.safeParse(frontmatter.context);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'context');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
