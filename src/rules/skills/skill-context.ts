/**
 * Rule: skill-context
 *
 * Skill context must be 'fork' (the only documented value)
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
    description: 'Skill context must be "fork"',
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
        'The `context` field controls how a skill is executed. The only documented value is ' +
        '`fork`, which runs the skill in a separate subagent process. When using `fork`, the `agent` ' +
        "field must also be specified. If you don't need a separate agent, omit the `context` field entirely. " +
        'This rule delegates to the Zod schema for validation.',
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
            description: 'Using fork context with agent',
            code: '---\nname: deploy\ndescription: Deploys the application\ncontext: fork\nagent: deploy-agent\n---',
          },
          {
            description: 'No context field (runs inline by default)',
            code: '---\nname: lint\ndescription: Runs linting checks\n---',
          },
        ],
      },
      howToFix:
        'Set the `context` field to `fork` and specify an `agent` field, or omit `context` entirely ' +
        'to run the skill inline in the current conversation.',
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
