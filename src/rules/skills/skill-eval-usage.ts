/**
 * Rule: skill-eval-usage
 *
 * Warns when skill scripts use eval/exec functions which can execute arbitrary
 * code and pose security risks. Applies to shell scripts (eval) and Python scripts
 * (eval/exec).
 */

import { Rule } from '../../types/rule';

// Regex patterns for eval/exec detection
const SHELL_EVAL_REGEX = /\beval\s+/; // Matches shell eval command
const PYTHON_EVAL_EXEC_REGEX = /\beval\s*\(|\bexec\s*\(/; // Matches Python eval() or exec()

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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/skills/skill-eval-usage.md',
    docs: {
      recommended: true,
      summary: 'Detects use of eval() and exec() in skill scripts that can execute arbitrary code.',
      rationale:
        'eval/exec can execute arbitrary code, creating a code injection vulnerability in the skill.',
      details:
        'This rule warns when shell scripts use the `eval` command or Python scripts use `eval()` or `exec()`. ' +
        'These functions dynamically execute strings as code, which poses serious security risks including ' +
        'code injection, privilege escalation, and unexpected side effects. ' +
        'Skill scripts should use explicit, predictable logic rather than dynamic code evaluation. ' +
        'The rule checks `.sh` files for shell eval and `.py` files for Python eval/exec.',
      examples: {
        incorrect: [
          {
            description: 'Shell script using eval to execute a constructed command',
            code: '#!/bin/bash\ncmd="ls -la $USER_INPUT"\neval $cmd',
            language: 'bash',
          },
          {
            description: 'Python script using eval to parse user input',
            code: 'user_input = get_input()\nresult = eval(user_input)',
            language: 'bash',
          },
          {
            description: 'Python script using exec to run dynamic code',
            code: 'code_string = read_file("plugin.py")\nexec(code_string)',
            language: 'bash',
          },
        ],
        correct: [
          {
            description: 'Shell script using direct command execution',
            code: '#!/bin/bash\nls -la "$SAFE_DIR"',
            language: 'bash',
          },
          {
            description: 'Python script using safe parsing instead of eval',
            code: 'import json\ndata = json.loads(user_input)',
            language: 'bash',
          },
        ],
      },
      howToFix:
        'Replace eval/exec with explicit logic. For shell scripts, execute commands directly ' +
        'instead of constructing command strings. For Python, use safe parsers like `json.loads()`, ' +
        '`ast.literal_eval()`, or dedicated libraries for the data format you are processing.',
      whenNotToUse:
        'Only disable this rule if you have a well-audited use case where dynamic code execution ' +
        'is strictly necessary and all inputs are thoroughly validated and sanitized.',
      relatedRules: ['skill-dangerous-command', 'skill-path-traversal'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;
    const scriptName = filePath.split('/').pop() || filePath;

    // Check shell scripts for eval
    if (filePath.endsWith('.sh')) {
      if (SHELL_EVAL_REGEX.test(fileContent)) {
        context.report({
          message: `"eval" used in "${scriptName}"`,
        });
      }
    }

    // Check Python scripts for eval/exec
    if (filePath.endsWith('.py')) {
      if (PYTHON_EVAL_EXEC_REGEX.test(fileContent)) {
        context.report({
          message: `eval()/exec() used in "${scriptName}"`,
        });
      }
    }
  },
};
