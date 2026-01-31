/**
 * Rule: skill-missing-shebang
 *
 * Warns when shell scripts lack a shebang line. Shell scripts should start with
 * #!/bin/bash or #!/usr/bin/env bash for proper execution.
 */

import { Rule } from '../../types/rule';

/**
 * Missing shebang validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-shebang',
    name: 'Skill Missing Shebang',
    description: 'Shell script lacks shebang line',
    category: 'Skills',
    severity: 'warn',
    fixable: true,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/skills/skill-missing-shebang.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only check shell scripts
    if (!filePath.endsWith('.sh')) {
      return;
    }

    // Check for shebang
    if (!fileContent.startsWith('#!')) {
      const scriptName = filePath.split('/').pop() || filePath;

      context.report({
        message:
          `Shell script "${scriptName}" lacks shebang line. ` +
          'Add "#!/bin/bash" or "#!/usr/bin/env bash" as the first line.',
        fix: 'Add #!/usr/bin/env bash as first line',
      });
    }
  },
};
