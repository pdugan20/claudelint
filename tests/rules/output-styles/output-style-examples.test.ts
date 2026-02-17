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
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style for validation
---

# Guidelines

Follow these formatting guidelines.`,
        },
      ],

      invalid: [],
    });
  });
});
