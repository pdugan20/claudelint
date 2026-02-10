/**
 * Rule: skill-shell-script-hardcoded-paths
 *
 * Warns when shell scripts contain hardcoded absolute paths that make
 * the script non-portable across different systems and user environments.
 */

import { Rule } from '../../types/rule';

/**
 * Paths that are safe to use and should not trigger warnings
 */
const SAFE_PATHS = [
  '/dev/null',
  '/dev/stdin',
  '/dev/stdout',
  '/dev/stderr',
  '/dev/zero',
  '/dev/urandom',
  '/dev/random',
  '/tmp',
  '/usr/bin/env',
  '/bin/bash',
  '/bin/sh',
  '/bin/zsh',
];

/**
 * Patterns for hardcoded paths that indicate non-portable scripts
 */
const HARDCODED_PATH_PATTERN = /(?:^|[\s=:"'])(\/(Users|home|opt|var|etc|usr\/local)\/\S+)/;

export const rule: Rule = {
  meta: {
    id: 'skill-shell-script-hardcoded-paths',
    name: 'Skill Shell Script Hardcoded Paths',
    description: 'Shell script contains hardcoded absolute paths that reduce portability',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-shell-script-hardcoded-paths.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check shell scripts
    if (!filePath.endsWith('.sh') && !filePath.endsWith('.bash')) {
      return;
    }

    const lines = fileContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip comments
      if (/^\s*#/.test(line)) {
        continue;
      }

      // Skip shebang
      if (i === 0 && line.startsWith('#!')) {
        continue;
      }

      const match = HARDCODED_PATH_PATTERN.exec(line);
      if (match) {
        const path = match[1];

        // Skip safe paths
        if (SAFE_PATHS.some((safe) => path.startsWith(safe))) {
          continue;
        }

        context.report({
          message:
            `Hardcoded path "${path}" reduces portability. ` +
            'Use environment variables ($HOME, $PWD) or relative paths instead.',
          line: i + 1,
        });
        return; // One warning per file is sufficient
      }
    }
  },
};
