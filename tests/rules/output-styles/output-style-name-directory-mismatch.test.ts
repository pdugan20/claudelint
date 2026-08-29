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
          content: '---\nname: concise\ndescription: Concise output\n---\n# Style',
          filePath: '/path/to/.claude/output-styles/concise.md',
        },
        {
          content: '---\nname: signal-only\ndescription: Terse output\n---\n# Style',
          filePath: 'output-styles/signal-only.md',
        },
        {
          // The filename supplies the name when frontmatter omits it.
          content: '---\ndescription: Concise output\n---\n# Style',
          filePath: '/path/to/.claude/output-styles/concise.md',
        },
        {
          content: '---\nname: code-style\ndescription: Formats code output\n---\n# Style',
          filePath: '/path/to/.claude/output-styles/code-style/concise.md',
        },
        {
          content: '---\nname: minimal\ndescription: Minimal output\n---\n# Style',
          filePath: '.claude/output-styles/minimal/concise.md',
        },
        {
          content: '---\nname: verbose-logs\ndescription: Verbose logging\n---\n# Style',
          filePath: '/Users/test/.claude/output-styles/verbose-logs/concise.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: verbose\ndescription: Concise output\n---\n# Style',
          filePath: '/path/to/.claude/output-styles/concise.md',
          errors: [
            {
              message: 'Output style name "verbose" does not match file name "concise"',
            },
          ],
        },
        {
          content: '---\nname: wrong-name\ndescription: Terse output\n---\n# Style',
          filePath: 'output-styles/signal-only.md',
          errors: [
            {
              message: 'Output style name "wrong-name" does not match file name "signal-only"',
            },
          ],
        },
        {
          content: '---\nname: wrong-name\ndescription: Formats code output\n---\n# Style',
          filePath: '/path/to/.claude/output-styles/code-style/concise.md',
          errors: [
            {
              message:
                'Output style name "wrong-name" does not match directory name "code-style"',
            },
          ],
        },
        {
          content: '---\nname: Minimal\ndescription: Minimal output\n---\n# Style',
          filePath: '.claude/output-styles/minimal/concise.md',
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
