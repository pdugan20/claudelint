/**
 * Rule: skill-path-traversal
 *
 * Warns when skill scripts contain potential path traversal patterns (../ or ..\)
 * which could be exploited to access files outside the intended directory.
 */

import { Rule } from '../../types/rule';
import { PATH_TRAVERSAL_REGEX } from '../../validators/constants';

/**
 * Path traversal validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-path-traversal',
    name: 'Skill Path Traversal',
    description: 'Potential path traversal pattern detected',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-path-traversal.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;
    const scriptName = filePath.split('/').pop() || filePath;

    // Only check script files
    const scriptExtensions = ['.sh', '.py', '.js', '.ts'];
    const isScriptFile = scriptExtensions.some((ext) => filePath.endsWith(ext));

    if (!isScriptFile) {
      return;
    }

    // Check for path traversal patterns
    if (PATH_TRAVERSAL_REGEX.test(fileContent)) {
      context.report({
        message:
          `Potential path traversal detected in "${scriptName}" (../ or ..\\). ` +
          'Ensure file paths are properly validated to prevent directory traversal attacks.',
      });
    }
  },
};
