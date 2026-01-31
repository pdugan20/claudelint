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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/agents/agent-skills-not-found.md',
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
