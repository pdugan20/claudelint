/**
 * Tests for output-style-missing-guidelines rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-missing-guidelines';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-missing-guidelines', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-missing-guidelines', rule, {
      valid: [
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

# Guidelines

Follow these formatting guidelines.`,
        },
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

## Rules

Follow these rules.`,
        },
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

### Format

Use this format.`,
        },
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

# Guideline

Follow this guideline.`,
        },
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

## GUIDELINES

Follow these GUIDELINES.`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---

# Examples

Some examples without guidelines section.`,
          errors: [{ message: 'should include a "Guidelines" or "Format" section' }],
        },
        {
          filePath: '.claude/output-styles/test-style/test-style.md',
          content: `---
name: test-style
description: Test output style
---
`,
          errors: [{ message: 'should include a "Guidelines" or "Format" section' }],
        },
      ],
    });
  });
});
