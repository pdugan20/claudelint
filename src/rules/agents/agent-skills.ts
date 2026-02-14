/**
 * Rule: agent-skills
 *
 * Agent skills must be an array of skill names
 *
 * Uses thin wrapper pattern: delegates to AgentFrontmatterSchema.shape.skills for validation
 */

import { Rule, RuleContext } from '../../types/rule';
import { AgentFrontmatterSchema } from '../../schemas/agent-frontmatter.schema';
import { extractFrontmatter, getFrontmatterFieldLine } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'agent-skills',
    name: 'Agent Skills Format',
    description: 'Agent skills must be an array of skill names',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-skills.md',
    docs: {
      recommended: true,
      summary:
        'Validates that agent skills is a properly formatted array ' + 'of skill name strings.',
      rationale:
        'A malformed skills array prevents the agent framework from correctly resolving and loading skill definitions.',
      details:
        'This rule enforces that the `skills` field in agent ' +
        'markdown frontmatter is a valid array of strings. Each ' +
        'entry should be a skill name corresponding to a directory ' +
        'under `.claude/skills/`. Validation is delegated to the ' +
        'AgentFrontmatterSchema.shape.skills Zod schema. Proper ' +
        'formatting ensures the agent framework can correctly ' +
        'resolve and load skill definitions.',
      examples: {
        incorrect: [
          {
            description: 'Skills as a single string instead of array',
            code:
              '---\nname: deploy-agent\n' +
              'description: Handles deployment pipelines\n' +
              'skills: run-tests\n---',
          },
          {
            description: 'Skills with non-string entries',
            code:
              '---\nname: deploy-agent\n' +
              'description: Handles deployment pipelines\n' +
              'skills:\n  - 42\n  - true\n---',
          },
        ],
        correct: [
          {
            description: 'Skills as a valid array of skill names',
            code:
              '---\nname: deploy-agent\n' +
              'description: Handles deployment pipelines\n' +
              'skills:\n  - run-tests\n  - deploy\n---',
          },
        ],
      },
      howToFix:
        'Ensure `skills` is formatted as a YAML array of strings. ' +
        'Each entry should be the name of a skill directory under ' +
        '`.claude/skills/`.',
      relatedRules: ['agent-skills-not-found'],
    },
  },
  validate: (context: RuleContext) => {
    const { frontmatter } = extractFrontmatter(context.fileContent);

    if (!frontmatter || !frontmatter.skills) {
      return;
    }

    const skillsSchema = AgentFrontmatterSchema.shape.skills;
    const result = skillsSchema.safeParse(frontmatter.skills);

    if (!result.success) {
      const line = getFrontmatterFieldLine(context.fileContent, 'skills');
      context.report({
        message: result.error.issues[0].message,
        line,
      });
    }
  },
};
