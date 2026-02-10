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
