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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-shell-script-hardcoded-paths.md',
    docs: {
      summary: 'Warns when shell scripts contain hardcoded absolute paths that reduce portability.',
      rationale:
        'Hardcoded absolute paths break the skill on any machine with a different directory structure.',
      details:
        'Hardcoded absolute paths like `/Users/john/project` or `/home/deploy/app` make shell scripts ' +
        'non-portable across different systems, users, and environments. This rule scans `.sh` and ' +
        '`.bash` files for paths under `/Users`, `/home`, `/opt`, `/var`, `/etc`, and `/usr/local`. ' +
        'Standard system paths like `/dev/null`, `/tmp`, `/usr/bin/env`, and shell paths are excluded. ' +
        'Comments and shebang lines are also skipped. Only one warning per file is reported.',
      examples: {
        incorrect: [
          {
            description: 'Script with hardcoded home directory path',
            code: '#!/bin/bash\n' + 'set -euo pipefail\n' + 'CONFIG="/Users/john/project/.config"',
            language: 'bash',
          },
          {
            description: 'Script referencing a hardcoded /opt path',
            code:
              '#!/bin/bash\n' + 'set -euo pipefail\n' + 'source /opt/mycompany/scripts/common.sh',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Script using environment variables for paths',
            code: '#!/bin/bash\n' + 'set -euo pipefail\n' + 'CONFIG="$HOME/project/.config"',
            language: 'bash',
          },
          {
            description: 'Script using relative paths',
            code:
              '#!/bin/bash\n' +
              'set -euo pipefail\n' +
              'SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"\n' +
              'source "$SCRIPT_DIR/common.sh"',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Replace hardcoded absolute paths with environment variables like `$HOME`, `$PWD`, or ' +
        '`$(dirname "$0")` for script-relative paths. Use relative paths when possible.',
      relatedRules: ['skill-shell-script-no-error-handling', 'skill-path-traversal'],
    },
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
          message: `Hardcoded path: "${path}"`,
          line: i + 1,
        });
        return; // One warning per file is sufficient
      }
    }
  },
};
