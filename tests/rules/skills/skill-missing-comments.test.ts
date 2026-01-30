/**
 * Tests for skill-missing-comments rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-comments';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-comments', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-comments', rule, {
      valid: [
        // Short script (less than 10 lines)
        {
          content: '#!/bin/bash\necho "Hello"\nls',
          filePath: '/test/script.sh',
        },

        // Script with comments
        {
          content: '#!/bin/bash\n# This script does something\necho "Line 1"\necho "Line 2"\necho "Line 3"\necho "Line 4"\necho "Line 5"\necho "Line 6"\necho "Line 7"\necho "Line 8"\necho "Line 9"\necho "Line 10"\n# Another comment\necho "Line 11"',
          filePath: '/test/script.sh',
        },

        // Not a shell script
        {
          content: 'import os\n' + 'print("Line")\n'.repeat(20),
          filePath: '/test/script.py',
        },

        // Empty lines don't count
        {
          content: '#!/bin/bash\n\n\n\necho "test"\n\n\n',
          filePath: '/test/script.sh',
        },
      ],

      invalid: [
        // Long script without comments (more than 10 non-empty lines, only shebang)
        {
          content: '#!/bin/bash\necho "Line 1"\necho "Line 2"\necho "Line 3"\necho "Line 4"\necho "Line 5"\necho "Line 6"\necho "Line 7"\necho "Line 8"\necho "Line 9"\necho "Line 10"\necho "Line 11"',
          filePath: '/test/script.sh',
          errors: [
            {
              message: 'no explanatory comments',
            },
          ],
        },

        // Long script with only shebang
        {
          content: '#!/bin/bash\n' + 'ls -la\n'.repeat(15),
          filePath: '/test/long-script.sh',
          errors: [
            {
              message: 'no explanatory comments',
            },
          ],
        },
      ],
    });
  });
});
