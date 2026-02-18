/**
 * Rule: skill-missing-changelog
 *
 * Warns when skill directories lack a CHANGELOG.md file. A changelog helps users
 * understand what changed between versions and track the evolution of the skill.
 */

import { Rule } from '../../types/rule';
import { fileExists } from '../../utils/filesystem/files';
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
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/skills/skill-missing-changelog',
    docs: {
      summary: 'Warns when a skill directory is missing a CHANGELOG.md file.',
      rationale:
        'Without a changelog, users cannot track what changed between versions or assess upgrade risk.',
      details:
        'A changelog helps users understand what changed between versions and track the evolution of a skill. ' +
        'This rule checks that a `CHANGELOG.md` file exists in the same directory as the SKILL.md file. ' +
        'Without a changelog, users have no reliable way to review the history of changes ' +
        'or assess the impact of upgrading to a newer version.',
      examples: {
        incorrect: [
          {
            description: 'Skill directory without CHANGELOG.md',
            code: '.claude/skills/deploy/\n  SKILL.md\n  deploy.sh',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Skill directory with CHANGELOG.md',
            code: '.claude/skills/deploy/\n  SKILL.md\n  CHANGELOG.md\n  deploy.sh',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Create a `CHANGELOG.md` file in the skill directory alongside SKILL.md. ' +
        'Follow the [Keep a Changelog](https://keepachangelog.com/) format and ' +
        'document notable changes for each version of the skill.',
      relatedRules: ['skill-missing-version'],
    },
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
