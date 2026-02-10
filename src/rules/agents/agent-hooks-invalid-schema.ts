/**
 * Rule: agent-hooks-invalid-schema
 *
 * Validates that hooks in agents.json have correct structure and required fields.
 *
 * This validation is implemented in AgentsValidator.validateFrontmatter() which uses
 * the shared validateSettingsHooks() utility from validation-helpers.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'agent-hooks-invalid-schema',
    name: 'Agent Hooks Invalid Schema',
    description: 'Hook configuration in agents.json violates schema requirements',
    category: 'Agents',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/agents/agent-hooks-invalid-schema.md',
  },
  validate: () => {
    // No-op: Validation implemented in AgentsValidator.validateFrontmatter()
    // Uses shared validateSettingsHooks() utility which returns ValidationIssues with rule IDs
  },
};
