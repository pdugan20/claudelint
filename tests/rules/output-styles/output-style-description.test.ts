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
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Formats output in a clean readable style
---

# Guidelines

Follow these formatting guidelines.`,
        },
        {
          filePath: '.claude/output-styles/verbose/verbose.md',
          content: `---
name: verbose
description: Produces detailed verbose output with explanations
---

# Guidelines

Use detailed formatting.`,
        },
      ],

      invalid: [],
    });
  });
});
