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
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style for validation
---

# Guidelines

Follow these formatting guidelines.`,
        },
        {
          filePath: '.claude/output-styles/my-format/my-format.md',
          content: `---
name: my-format
description: Another test output style
---

# Guidelines

Follow these rules.`,
        },
      ],

      invalid: [],
    });
  });
});
