/**
 * Rule: commands-migrate-to-skills
 *
 * Provides detailed migration guidance when .claude/commands directory is detected.
 * This rule complements commands-deprecated-directory with step-by-step instructions.
 */

import { Rule } from '../../types/rule';
import { directoryExists, resolvePath } from '../../utils/filesystem/files';
import { join } from 'path';

/**
 * Commands migration guidance rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'commands-migrate-to-skills',
    name: 'Commands Migrate To Skills',
    description: 'Migration guidance for deprecated Commands',
    category: 'Commands',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/commands/commands-migrate-to-skills.md',
    docs: {
      recommended: true,
      summary: 'Provides step-by-step migration guidance from Commands to Skills.',
      details:
        'This rule complements `commands-deprecated-directory` by providing detailed, ' +
        'actionable migration instructions when a `.claude/commands` directory is detected. ' +
        'It walks through the four steps needed to convert each command into a properly ' +
        'structured skill: creating the skill directory, moving scripts, adding SKILL.md ' +
        'with frontmatter, and updating plugin.json references.',
      examples: {
        incorrect: [
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
        '1. Create a skill directory: `.claude/skills/<skill-name>/`\n' +
        '2. Move command scripts to `<skill-name>/<skill-name>.sh`\n' +
        '3. Add a `SKILL.md` with YAML frontmatter (name, description) and documentation\n' +
        '4. Update `plugin.json` to reference skills instead of commands\n' +
        '5. Remove the old command file from `.claude/commands/`',
      relatedRules: ['commands-deprecated-directory'],
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
        message:
          'To migrate: 1) Create skill directories in .claude/skills/<skill-name>, ' +
          '2) Move command scripts to <skill-name>/<skill-name>.sh, ' +
          '3) Add SKILL.md with frontmatter and documentation, ' +
          '4) Update plugin.json to reference skills instead of commands',
      });
    }
  },
};
