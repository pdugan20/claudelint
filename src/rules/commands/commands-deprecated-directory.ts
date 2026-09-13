/**
 * Rule: commands-deprecated-directory
 *
 * Advises using skills for new work when the supported legacy command format is present.
 * Authority: docs-baseline/skills.md (custom commands and command-file compatibility).
 */

import { Rule } from '../../types/rule';
import { directoryExists, resolvePath } from '../../utils/filesystem/files';
import { join } from 'path';

/**
 * Identifies the legacy .claude/commands directory for an optional migration advisory
 */
export const rule: Rule = {
  meta: {
    id: 'commands-deprecated-directory',
    name: 'Commands Legacy Directory',
    description: 'Legacy commands directory; prefer skills for new work',
    category: 'Commands',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/commands/commands-deprecated-directory',
    docs: {
      recommended: true,
      summary: 'Advises using skills for new work when .claude/commands is present.',
      rationale:
        'Existing command files remain supported. Skills add a directory for supporting files and are preferred for new work.',
      details:
        'Commands were the original way to add custom slash commands to Claude Code, ' +
        'and remain supported with the same invocation behavior. Skills add a directory for ' +
        'supporting files and are preferred for new work. ' +
        'This rule fires when a `.claude/commands` directory exists in the project, ' +
        'as an optional migration advisory, not an unsupported-format error. The authority is the ' +
        '[Skills reference](https://code.claude.com/docs/en/skills).',
      examples: {
        incorrect: [
          {
            description: 'Project with a .claude/commands directory',
            code: '.claude/\n' + '  commands/\n' + '    deploy.md\n' + '    test-all.md',
            language: 'text',
          },
          {
            description: 'Legacy command file in .claude/commands',
            code:
              '# .claude/commands/deploy.md\n' +
              'Run the deployment script.\n\n' +
              '```bash\n' +
              './scripts/deploy.sh\n' +
              '```',
            language: 'markdown',
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
          {
            description: 'Equivalent skill with proper structure',
            code:
              '# .claude/skills/deploy/SKILL.md\n' +
              '---\n' +
              'name: deploy\n' +
              'description: Run the deployment script\n' +
              '---\n\n' +
              '## Usage\n\n' +
              'Invoke with `/deploy` to run the deployment pipeline.',
            language: 'markdown',
          },
        ],
      },
      howToFix:
        'For new work, create a `.claude/skills/<skill-name>/` directory with a `SKILL.md` ' +
        'and move command scripts into it. Then remove the old `.claude/commands/` directory. ' +
        'See the [Skills documentation](https://code.claude.com/docs/en/skills) for the full format.',
      whenNotToUse:
        'Disable this rule if you are intentionally maintaining legacy commands ' +
        'alongside skills during a gradual migration.',
      relatedRules: ['plugin-commands-deprecated'],
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
        message: 'Legacy commands directory',
      });
    }
  },
};
