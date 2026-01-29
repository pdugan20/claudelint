/**
 * Rule: skill-missing-examples
 *
 * Warns when SKILL.md lacks usage examples. Skills should include code blocks or
 * an "Example" section to help users understand how to use the skill.
 */

import { Rule } from '../../types/rule';

/**
 * Missing examples validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-examples',
    name: 'Skill Missing Examples',
    description: 'SKILL.md lacks usage examples',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-examples.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check for code blocks or example sections
    const hasCodeBlocks = /```[\s\S]*?```/.test(fileContent);
    const hasExampleSection = /##?\s+(Example|Usage|Examples)/i.test(fileContent);

    if (!hasCodeBlocks && !hasExampleSection) {
      context.report({
        message:
          'SKILL.md lacks usage examples. ' +
          'Add code blocks or an "Example" section to help users understand how to use this skill.',
      });
    }
  },
};
