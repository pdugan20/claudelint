/**
 * Rule: commands-deprecated-directory
 *
 * Warns when .claude/commands directory is detected. Commands are deprecated
 * in favor of Skills, which provide better structure, versioning, and documentation.
 */

import { Rule } from '../../types/rule';
import { directoryExists, resolvePath } from '../../utils/filesystem/files';
import { join } from 'path';

/**
 * Deprecated commands directory validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'commands-deprecated-directory',
    name: 'Commands Deprecated Directory',
    description: 'Commands directory is deprecated, migrate to Skills',
    category: 'Commands',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/commands/commands-deprecated-directory',
    docs: {
      recommended: true,
      summary: 'Warns when the deprecated .claude/commands directory is detected.',
      rationale:
        'Commands are deprecated and no longer receive updates; skills provide frontmatter, versioning, and better tooling.',
      details:
        'Commands were the original way to add custom slash commands to Claude Code, ' +
        'but they have been superseded by Skills. Skills provide better structure with ' +
        'YAML frontmatter, versioning, documentation, and reference file support. ' +
        'This rule fires when a `.claude/commands` directory exists in the project, ' +
        'prompting migration to the Skills format.',
      examples: {
        incorrect: [
          {
            description: 'Project with a .claude/commands directory',
            code: '.claude/\n' + '  commands/\n' + '    deploy.md\n' + '    test-all.md',
            language: 'text',
          },
        ],
        correct: [
          {
            description: 'Project migrated to Skills',
            code:
              '.claude/\n' +
              '  skills/\n' +
              '    deploy/\n' +
              '      SKILL.md\n' +
              '      deploy.sh\n' +
              '    test-all/\n' +
              '      SKILL.md\n' +
              '      test-all.sh',
            language: 'text',
          },
        ],
      },
      howToFix:
        'Create equivalent skills in `.claude/skills/` for each command in `.claude/commands/`. ' +
        'Each skill needs a directory with a SKILL.md file containing YAML frontmatter. ' +
        'After migrating all commands, remove the `.claude/commands/` directory.',
      whenNotToUse:
        'Disable this rule if you are intentionally maintaining legacy commands ' +
        'alongside skills during a gradual migration.',
      relatedRules: ['commands-migrate-to-skills'],
    },
  },

  validate: async (context) => {
    const { filePath } = context;

    // filePath is the base directory to check from (typically project root)
    const claudeDir = resolvePath(filePath, '.claude');
    const commandsDir = join(claudeDir, 'commands');

    const exists = await directoryExists(commandsDir);
    if (exists) {
      context.report({
        message: 'Commands directory is deprecated',
      });
    }
  },
};
