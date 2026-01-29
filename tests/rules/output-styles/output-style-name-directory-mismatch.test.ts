/**
 * Tests for output-style-name-directory-mismatch rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-name-directory-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-name-directory-mismatch', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-name-directory-mismatch', rule, {
      valid: [
        {
          content: '---\nname: code-style\ndescription: Formats code output\n---\n# Style',
          filePath: '/path/to/.claude/output_styles/code-style/OUTPUT_STYLE.md',
        },
        {
          content: '---\nname: minimal\ndescription: Minimal output\n---\n# Style',
          filePath: '.claude/output_styles/minimal/OUTPUT_STYLE.md',
        },
        {
          content: '---\nname: verbose-logs\ndescription: Verbose logging\n---\n# Style',
          filePath: '/Users/test/.claude/output_styles/verbose-logs/OUTPUT_STYLE.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: wrong-name\ndescription: Formats code output\n---\n# Style',
          filePath: '/path/to/.claude/output_styles/code-style/OUTPUT_STYLE.md',
          errors: [
            {
              message:
                'Output style name "wrong-name" does not match directory name "code-style"',
            },
          ],
        },
        {
          content: '---\nname: Minimal\ndescription: Minimal output\n---\n# Style',
          filePath: '.claude/output_styles/minimal/OUTPUT_STYLE.md',
          errors: [
            {
              message: 'Output style name "Minimal" does not match directory name "minimal"',
            },
          ],
        },
      ],
    });
  });
});
