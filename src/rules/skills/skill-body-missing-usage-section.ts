/**
 * Rule: skill-body-missing-usage-section
 *
 * Warns when SKILL.md body lacks a ## Usage section. A dedicated usage
 * section helps users understand how to invoke and interact with the skill.
 */

import { Rule, RuleContext } from '../../types/rule';
import { extractBodyContent } from '../../utils/formats/markdown';

export const rule: Rule = {
  meta: {
    id: 'skill-body-missing-usage-section',
    name: 'Skill Body Missing Usage Section',
    description: 'SKILL.md body lacks a ## Usage section',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-body-missing-usage-section.md',
  },

  validate: (context: RuleContext) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    const body = extractBodyContent(fileContent);

    if (!body) {
      return; // No body to check (handled by other rules)
    }

    const hasUsageSection = /^##\s+Usage/im.test(body);

    if (!hasUsageSection) {
      context.report({
        message:
          'SKILL.md body lacks a "## Usage" section. ' +
          'Add a usage section to help users understand how to invoke this skill.',
        fix: 'Add a "## Usage" section with invocation examples',
      });
    }
  },
};
