/**
 * Rule: commands-migrate-to-skills
 *
 * Provides detailed migration guidance when .claude/commands directory is detected.
 * This rule complements commands-deprecated-directory with step-by-step instructions.
 */

import { Rule } from '../../types/rule';
import { directoryExists, resolvePath } from '../../utils/file-system';
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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/commands/commands-migrate-to-skills.md',
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
