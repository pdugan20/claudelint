/**
 * Rule: commands-deprecated-directory
 *
 * Warns when .claude/commands directory is detected. Commands are deprecated
 * in favor of Skills, which provide better structure, versioning, and documentation.
 */

import { Rule } from '../../types/rule';
import { directoryExists, resolvePath } from '../../utils/file-system';
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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/commands/commands-deprecated-directory.md',
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
          'Commands directory (.claude/commands) is deprecated. Please migrate to Skills (.claude/skills). ' +
          'Skills provide better structure, versioning, and documentation. ' +
          'See: https://docs.anthropic.com/claude-code/skills',
      });
    }
  },
};
