/**
 * Rule: agent-skills-not-found
 *
 * Validates that skills referenced in agent configurations actually exist.
 *
 * Agents can reference skills in their frontmatter. This rule ensures those
 * skill files exist at .claude/skills/{skill-name}/SKILL.md
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractFrontmatter } from '../../utils/formats/markdown';
import { fileExists } from '../../utils/filesystem/files';
import { dirname, join } from 'path';

export const rule: Rule = {
  meta: {
    id: 'agent-skills-not-found',
    name: 'Agent Skills Not Found',
    description: 'Referenced skill does not exist in .claude/skills directory',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/agents/agent-skills-not-found',
    docs: {
      recommended: true,
      summary: 'Validates that skills referenced in agent frontmatter ' + 'exist on disk.',
      rationale:
        'Referencing a nonexistent skill causes the agent to fail when it tries to load or invoke it at runtime.',
      details:
        'This rule checks that every skill name listed in the ' +
        '`skills` array of agent frontmatter has a corresponding ' +
        'SKILL.md file at `.claude/skills/{skill-name}/SKILL.md`. ' +
        'Referencing a nonexistent skill causes the agent to fail ' +
        'when it tries to load or invoke the skill at runtime. ' +
        'The rule resolves the project root from the agent file ' +
        'path and checks each referenced skill directory.',
      examples: {
        incorrect: [
          {
            description: 'Agent references a skill that does not exist',
            code:
              '---\nname: deploy-agent\n' +
              'description: Handles deployment pipelines\n' +
              'skills:\n  - nonexistent-skill\n---',
          },
        ],
        correct: [
          {
            description: 'Agent references skills that exist at ' + '.claude/skills/',
            code:
              '---\nname: deploy-agent\n' +
              'description: Handles deployment pipelines\n' +
              'skills:\n  - run-tests\n  - deploy\n---',
          },
        ],
      },
      howToFix:
        'Create the missing skill directory and SKILL.md file at ' +
        '`.claude/skills/{skill-name}/SKILL.md`, or remove the ' +
        'nonexistent skill name from the `skills` array.',
      relatedRules: ['agent-skills'],
    },
  },
  validate: async (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only validate agent .md files in .claude/agents/ directory
    if (!filePath.includes('.claude/agents/') || !filePath.endsWith('.md')) {
      return;
    }

    // Extract frontmatter to get skills array
    const { frontmatter } = extractFrontmatter(fileContent);
    if (!frontmatter || !frontmatter.skills || !Array.isArray(frontmatter.skills)) {
      return;
    }

    // Get project root: .claude/agents/name.md -> up 2 levels
    const agentsDir = dirname(filePath); // .claude/agents
    const claudeDir = dirname(agentsDir); // .claude
    const projectRoot = dirname(claudeDir); // project root
    const skillsDir = join(projectRoot, '.claude', 'skills');

    // Check each referenced skill exists
    for (const skillName of frontmatter.skills) {
      if (typeof skillName !== 'string') {
        continue;
      }

      const skillPath = join(skillsDir, skillName, 'SKILL.md');
      const exists = await fileExists(skillPath);

      if (!exists) {
        context.report({
          message: `Referenced skill not found: ${skillName}`,
        });
      }
    }
  },
};
