/**
 * Tests for output-style-body-too-short rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-body-too-short';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-body-too-short', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-body-too-short', rule, {
      valid: [
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Guidelines

This is a detailed output style with substantial body content that provides comprehensive formatting guidelines and examples for users.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          options: { minLength: 20 },
          content: `---
name: test-style
description: Test output style
---

This is long enough for custom threshold.`,
        },
        {
          filePath: '.claude/output_styles/test-style/README.md',
          content: `---
name: test-style
---

Short`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

Short body.`,
          errors: [{ message: 'Output style body content is very short' }],
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          options: { minLength: 150 },
          content: `---
name: test-style
description: Test output style
---

This is a medium-length body that is longer than 50 characters but not 150.`,
          errors: [{ message: 'minimum: 150' }],
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---
`,
          errors: [{ message: 'Output style body content is very short' }],
        },
      ],
    });
  });
});
