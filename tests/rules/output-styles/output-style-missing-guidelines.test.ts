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
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Guidelines

Follow these formatting guidelines.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

## Rules

Follow these rules.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

### Format

Use this format.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Guideline

Follow this guideline.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

## GUIDELINES

Follow these GUIDELINES.`,
        },
        {
          filePath: '.claude/output_styles/test-style/README.md',
          content: `---
name: test-style
---

No guidelines here.`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Examples

Some examples without guidelines section.`,
          errors: [{ message: 'should include a "Guidelines" or "Format" section' }],
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
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
