/**
 * Tests for output-style-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-name';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-name', rule, {
      valid: [
        {
          content: '---\nname: my-style\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
        {
          content: '---\nname: code-style\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: MyStyle\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
        {
          content: '---\nname: my_style\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
        {
          content: '---\nname: this-is-a-very-long-output-style-name-that-exceeds-sixty-four-characters\ndescription: Test output style\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: '64 characters' }],
        },
      ],
    });
  });
});
