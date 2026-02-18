/**
 * Rule: skill-agent
 *
 * When skill context is "fork", agent field is required to specify which agent to use
 *
 * Uses thin wrapper pattern: delegates to SkillFrontmatterWithRefinements for cross-field validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { SkillFrontmatterWithRefinements } from '../../schemas/skill-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-agent',
    name: 'Skill Agent Requirement',
    description:
      'When skill context is "fork", agent field is required to specify which agent to use',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-agent',
    docs: {
      recommended: true,
      summary: 'Requires the agent field when a skill uses fork context mode.',
      rationale:
        'A fork-mode skill without an agent field has no subagent to delegate to, causing a runtime failure.',
      details:
        'When a skill sets `context: fork`, it runs in a separate agent process. ' +
        'The `agent` field must be specified to tell the system which agent to use for the forked context. ' +
        'Without this field, the system cannot determine which agent should handle the skill execution. ' +
        'This rule performs cross-field validation between `context` and `agent` to catch this misconfiguration.',
      examples: {
        incorrect: [
          {
            description: 'Fork context without agent field',
            code: '---\nname: deploy\ndescription: Deploys the app to production\ncontext: fork\n---',
          },
        ],
        correct: [
          {
            description: 'Fork context with agent specified',
            code: '---\nname: deploy\ndescription: Deploys the app to production\ncontext: fork\nagent: deploy-agent\n---',
          },
          {
            description: 'Inline context does not require agent',
            code: '---\nname: lint\ndescription: Runs linting on the project\ncontext: inline\n---',
          },
        ],
      },
      howToFix:
        'Add an `agent` field to your SKILL.md frontmatter specifying which agent to use. ' +
        'If you do not need a separate agent process, change `context` to `inline` or `auto` instead.',
      relatedRules: ['skill-context'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter) {
      return;
    }

    // Use SkillFrontmatterWithRefinements for cross-field validation
    const result = SkillFrontmatterWithRefinements.safeParse(frontmatter);

    if (!result.success) {
      // Find agent-related errors
      const agentError = result.error.issues.find((issue) => issue.path.includes('agent'));

      if (agentError) {
        const line = getFrontmatterFieldLine(context.fileContent, 'agent');
        context.report({
          message: agentError.message,
          line,
        });
      }
    }
  },
};
