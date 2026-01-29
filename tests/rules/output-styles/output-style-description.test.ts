/**
 * Tests for output-style-description rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-description';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-description', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-description', rule, {
      valid: [
        {
          content: '---\nname: my-style\ndescription: Formats code output in a clean manner\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
        {
          content: '---\nname: my-style\ndescription: Provides structured output with clear headers and sections\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-style\ndescription: Too short\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'at least 10 characters' }],
        },
        {
          content: '---\nname: my-style\ndescription: I format the output nicely\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'third person' }],
        },
        {
          content: '---\nname: my-style\ndescription: You can format your code output\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'third person' }],
        },
        {
          content: '---\nname: my-style\ndescription: Formats <code> tags in output\n---\n# Style',
          filePath: '/test/output-styles/STYLE.md',
          errors: [{ message: 'XML tags' }],
        },
      ],
    });
  });
});
