/**
 * Tests for output-style-examples rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-examples';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-examples', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-examples', rule, {
      valid: [
        {
          content: '---\nname: my-style\ndescription: Test output style\nexamples:\n  - Example 1\n  - Example 2\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
        {
          content: '---\nname: my-style\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-style\ndescription: Test output style\nexamples: not-an-array\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'array' }],
        },
      ],
    });
  });
});
