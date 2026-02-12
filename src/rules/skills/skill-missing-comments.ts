/**
 * Rule: skill-missing-comments
 *
 * Warns when shell scripts have significant length but lack explanatory comments.
 * Scripts with more than 10 non-empty lines should include comments explaining their purpose.
 */

import { Rule } from '../../types/rule';
import { z } from 'zod';

const DEFAULT_MIN_LINES = 10;

/**
 * Options for skill-missing-comments rule
 */
export interface SkillMissingCommentsOptions {
  /** Minimum non-empty line count before comments required (default: 10) */
  minLines?: number;
}

/**
 * Missing comments validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-missing-comments',
    name: 'Skill Missing Comments',
    description: 'Shell script lacks explanatory comments',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-comments.md',
    schema: z.object({
      minLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLines: DEFAULT_MIN_LINES,
    },
    docs: {
      summary: 'Warns when shell scripts exceed a line threshold but lack explanatory comments.',
      details:
        'Shell scripts that are longer than a configurable threshold (default: 10 non-empty lines) ' +
        'should include comments explaining their purpose, approach, and any non-obvious logic. ' +
        'This rule counts non-empty lines and comment lines (lines starting with `#`). ' +
        'If the script exceeds the threshold but has at most one comment line (typically just the shebang), ' +
        'the rule reports a warning. Comments improve maintainability and help other developers ' +
        '(and AI models) understand the script without executing it.',
      examples: {
        incorrect: [
          {
            description: 'Long script with no explanatory comments',
            code: '#!/bin/bash\nnpm install\nnpm run build\nnpm run test\nnpm run lint\ncp dist/* /var/www/\nsystemctl restart app\ncurl -s http://localhost/health\necho "Done"\nrm -rf tmp/\nexit 0',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Script with explanatory comments',
            code: '#!/bin/bash\n# Deploy script: builds, tests, and deploys the application\nnpm install\nnpm run build\nnpm run test\n\n# Copy artifacts and restart the service\ncp dist/* /var/www/\nsystemctl restart app\n\n# Verify the deployment\ncurl -s http://localhost/health',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Add comments to the script explaining what it does, why certain steps are needed, ' +
        'and any non-obvious logic. At minimum, add a header comment describing the script purpose.',
      optionExamples: [
        {
          description: 'Require comments only for scripts longer than 20 lines',
          config: { minLines: 20 },
        },
        {
          description: 'Require comments for any script longer than 5 lines',
          config: { minLines: 5 },
        },
      ],
      whenNotToUse:
        'Disable this rule for auto-generated scripts where comments would be immediately overwritten.',
      relatedRules: ['skill-missing-shebang'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent, options } = context;
    const minLines = (options as SkillMissingCommentsOptions).minLines ?? DEFAULT_MIN_LINES;

    // Only check shell scripts
    if (!filePath.endsWith('.sh')) {
      return;
    }

    // Check for explanatory comments
    const lines = fileContent.split('\n');
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const commentLines = nonEmptyLines.filter((line) => line.trim().startsWith('#'));

    // If script has more than threshold lines but no comments (except shebang), warn
    if (nonEmptyLines.length > minLines && commentLines.length <= 1) {
      const scriptName = filePath.split('/').pop() || filePath;

      context.report({
        message:
          `Shell script "${scriptName}" has ${nonEmptyLines.length} lines but no explanatory comments. ` +
          'Add comments to explain what the script does and how it works.',
        fix: 'Add explanatory comments to the script',
      });
    }
  },
};
