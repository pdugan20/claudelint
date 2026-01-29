/**
 * Rule: skill-eval-usage
 *
 * Warns when skill scripts use eval/exec functions which can execute arbitrary
 * code and pose security risks. Applies to shell scripts (eval) and Python scripts
 * (eval/exec).
 */

import { Rule } from '../../types/rule';
import { SHELL_EVAL_REGEX, PYTHON_EVAL_EXEC_REGEX } from '../../validators/constants';

/**
 * Eval usage validation rule implementation
 */
export const rule: Rule = {
  meta: {
    id: 'skill-eval-usage',
    name: 'Skill Eval Usage',
    description: 'Script uses eval/exec which can execute arbitrary code',
    category: 'Skills',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-eval-usage.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;
    const scriptName = filePath.split('/').pop() || filePath;

    // Check shell scripts for eval
    if (filePath.endsWith('.sh')) {
      if (SHELL_EVAL_REGEX.test(fileContent)) {
        context.report({
          message:
            `Shell script "${scriptName}" uses "eval" command. ` +
            'Avoid eval as it can execute arbitrary code and poses security risks.',
        });
      }
    }

    // Check Python scripts for eval/exec
    if (filePath.endsWith('.py')) {
      if (PYTHON_EVAL_EXEC_REGEX.test(fileContent)) {
        context.report({
          message:
            `Python script "${scriptName}" uses eval() or exec(). ` +
            'These functions can execute arbitrary code and pose security risks.',
        });
      }
    }
  },
};
