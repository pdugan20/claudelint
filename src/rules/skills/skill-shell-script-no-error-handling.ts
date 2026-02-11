/**
 * Rule: skill-shell-script-no-error-handling
 *
 * Warns when shell scripts lack error handling (set -e or set -euo pipefail).
 * Without error handling, scripts continue executing after failures, which
 * can cause cascading issues.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'skill-shell-script-no-error-handling',
    name: 'Skill Shell Script No Error Handling',
    description: 'Shell script lacks error handling (set -e or set -euo pipefail)',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-shell-script-no-error-handling.md',
    docs: {
      recommended: true,
      summary:
        'Warns when shell scripts lack error handling such as `set -e` or `set -euo pipefail`.',
      details:
        'Without proper error handling, shell scripts continue executing after a command fails, ' +
        'which can cause cascading issues and data corruption. This rule checks `.sh` and `.bash` ' +
        'files for the presence of `set -e`, `set -euo pipefail`, or a `trap ... ERR` handler. ' +
        'If none are found, a warning is reported with an auto-fix that inserts `set -euo pipefail` ' +
        'after the shebang line.',
      examples: {
        incorrect: [
          {
            description: 'Script with no error handling',
            code:
              '#!/bin/bash\n' +
              'echo "Building..."\n' +
              'npm run build\n' +
              'echo "Deploying..."\n' +
              'npm run deploy',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Script with set -euo pipefail',
            code:
              '#!/bin/bash\n' +
              'set -euo pipefail\n' +
              'echo "Building..."\n' +
              'npm run build\n' +
              'echo "Deploying..."\n' +
              'npm run deploy',
            language: 'bash',
          },
          {
            description: 'Script with trap-based error handling',
            code:
              '#!/bin/bash\n' +
              'trap \'echo "Error on line $LINENO"; exit 1\' ERR\n' +
              'npm run build',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Add `set -euo pipefail` immediately after the shebang line. This causes the script to ' +
        'exit on any command failure (`-e`), undefined variable usage (`-u`), and pipe failures (`-o pipefail`). ' +
        'The auto-fixer inserts this line automatically.',
      relatedRules: ['skill-shell-script-hardcoded-paths', 'skill-missing-shebang'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check shell scripts
    if (!filePath.endsWith('.sh') && !filePath.endsWith('.bash')) {
      return;
    }

    // Check for error handling patterns
    const hasSetE = /set\s+-e\b/.test(fileContent);
    const hasSetEuo = /set\s+-euo\b/.test(fileContent);
    const hasPipefail = /set\s+.*pipefail/.test(fileContent);
    const hasTrap = /trap\s+.*ERR/.test(fileContent);

    if (!hasSetE && !hasSetEuo && !hasPipefail && !hasTrap) {
      const scriptName = filePath.split('/').pop() || filePath;

      context.report({
        message:
          `Shell script "${scriptName}" lacks error handling. ` +
          'Add "set -euo pipefail" near the top of the script to exit on errors.',
        fix: 'Add set -euo pipefail after the shebang line',
        autoFix: {
          ruleId: 'skill-shell-script-no-error-handling',
          description: 'Add set -euo pipefail after shebang',
          filePath,
          apply: (content) => {
            // Insert after shebang line if present, otherwise at top
            if (content.startsWith('#!')) {
              const newlineIndex = content.indexOf('\n');
              return (
                content.substring(0, newlineIndex + 1) +
                'set -euo pipefail\n' +
                content.substring(newlineIndex + 1)
              );
            }
            return 'set -euo pipefail\n' + content;
          },
        },
      });
    }
  },
};
