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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-missing-comments.md',
    schema: z.object({
      minLines: z.number().positive().int().optional(),
    }),
    defaultOptions: {
      minLines: DEFAULT_MIN_LINES,
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
