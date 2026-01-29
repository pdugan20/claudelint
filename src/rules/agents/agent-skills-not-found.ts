/**
 * Rule: agent-skills-not-found
 *
 * Validates that skills referenced in agent configurations actually exist.
 *
 * This validation is implemented in AgentsValidator.validateSkills() which has
 * access to filesystem context needed to check skill existence.
 */

import { Rule } from '../../types/rule';

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
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-skills-not-found.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentsValidator.validateSkills()
    // Requires filesystem access to check if .claude/skills/{name}/SKILL.md exists
  },
};
