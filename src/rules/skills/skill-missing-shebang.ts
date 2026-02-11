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
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-shebang.md',
    docs: {
      recommended: true,
      summary: 'Warns when shell script files are missing a shebang line.',
      details:
        'Shell scripts must start with a shebang line (e.g., `#!/bin/bash` or `#!/usr/bin/env bash`) ' +
        'to specify which interpreter should execute them. Without a shebang, the script may fail or ' +
        'run under an unexpected shell, leading to subtle bugs. ' +
        'This rule checks all `.sh` files within skill directories. ' +
        'This rule is auto-fixable and will prepend `#!/usr/bin/env bash` to scripts that lack a shebang.',
      examples: {
        incorrect: [
          {
            description: 'Shell script without shebang',
            code: 'echo "Hello, world!"\nexit 0',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Shell script with env shebang',
            code: '#!/usr/bin/env bash\necho "Hello, world!"\nexit 0',
            language: 'bash',
          },
          {
            description: 'Shell script with direct bash path',
            code: '#!/bin/bash\necho "Hello, world!"\nexit 0',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Add a shebang line as the very first line of your shell script. ' +
        'The recommended shebang is `#!/usr/bin/env bash` for portability. ' +
        'Alternatively, run the auto-fixer which will prepend it automatically.',
      relatedRules: ['skill-missing-version'],
    },
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
        autoFix: {
          ruleId: 'skill-missing-shebang',
          description: 'Add #!/usr/bin/env bash shebang line',
          filePath,
          apply: (content) => `#!/usr/bin/env bash\n${content}`,
        },
      });
    }
  },
};
