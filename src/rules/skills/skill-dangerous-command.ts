/**
 * Rule: skill-dangerous-command
 *
 * Validates that skill scripts don't contain dangerous commands that could cause
 * system damage or data loss. This is a critical security check.
 */

import { Rule } from '../../types/rule';
import { DANGEROUS_COMMANDS } from '../../validators/constants';

/**
 * Dangerous command validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-dangerous-command',
    name: 'Skill Dangerous Command',
    description: 'Skill script contains dangerous commands that could cause system damage',
    category: 'Skills',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-dangerous-command.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check script files
    const isScriptFile =
      filePath.endsWith('.sh') ||
      filePath.endsWith('.py') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.ts');

    if (!isScriptFile) {
      return;
    }

    // Check for each dangerous command pattern
    for (const { pattern, message } of DANGEROUS_COMMANDS) {
      if (pattern.test(fileContent)) {
        const scriptName = filePath.split('/').pop() || filePath;

        context.report({
          message:
            `Dangerous command detected in "${scriptName}": ${message}. ` +
            'This command could cause data loss or system damage.',
          fix: 'Remove or replace the dangerous command with a safer alternative',
        });
      }
    }
  },
};
