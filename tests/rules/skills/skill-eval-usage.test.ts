/**
 * Tests for skill-eval-usage rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-eval-usage';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-eval-usage', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-eval-usage', rule, {
      valid: [
        // Shell script without eval
        {
          content: '#!/bin/bash\necho "Hello World"\nls -la',
          filePath: '/test/script.sh',
        },

        // Python script without eval/exec
        {
          content: 'import os\nprint("Hello World")\nos.system("ls")',
          filePath: '/test/script.py',
        },

        // Not a script file
        {
          content: 'This text mentions eval in documentation',
          filePath: '/test/README.md',
        },

        // Word "eval" in a comment
        {
          content: '#!/bin/bash\n# We should evaluate this later\necho "test"',
          filePath: '/test/script.sh',
        },
      ],

      invalid: [
        // Shell script with eval
        {
          content: '#!/bin/bash\neval "$COMMAND"\necho "done"',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'uses "eval" command',
            },
          ],
        },

        // Python script with eval
        {
          content: 'import os\nresult = eval("2 + 2")\nprint(result)',
          filePath: '/test/script.py',
          errors: [
            {
              message: 'uses eval() or exec()',
            },
          ],
        },

        // Python script with exec
        {
          content: 'code = "print(\'hello\')"\nexec(code)',
          filePath: '/test/script.py',
          errors: [
            {
              message: 'uses eval() or exec()',
            },
          ],
        },

        // Shell script with eval and other commands
        {
          content: '#!/bin/bash\necho "Starting"\neval "rm -rf /tmp/test"\necho "Done"',
          filePath: '/test/dangerous.sh',
          errors: [
            {
              message: 'uses "eval" command',
            },
          ],
        },
      ],
    });
  });
});
