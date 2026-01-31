/**
 * Rule: skill-missing-changelog
 *
 * Warns when skill directories lack a CHANGELOG.md file. A changelog helps users
 * understand what changed between versions and track the evolution of the skill.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/file-system';
import { join, dirname } from 'path';

/**
 * Missing changelog validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-changelog',
    name: 'Skill Missing Changelog',
    description: 'Skill directory lacks CHANGELOG.md',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-missing-changelog.md',
  },

  validate: async (context) => {
    const { filePath } = context;

    // Only check SKILL.md files
    if (!filePath.endsWith('SKILL.md')) {
      return;
    }

    // Check if CHANGELOG.md exists in the skill directory
    const skillDir = dirname(filePath);
    const changelogPath = join(skillDir, 'CHANGELOG.md');
    const changelogExists = await fileExists(changelogPath);

    if (!changelogExists) {
      context.report({
        message: 'Skill directory lacks CHANGELOG.md',
        fix: 'Create CHANGELOG.md',
      });
    }
  },
};
