/**
 * Tests for output-style-missing-examples rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/output-styles/output-style-missing-examples';

const ruleTester = new ClaudeLintRuleTester();

describe('output-style-missing-examples', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('output-style-missing-examples', rule, {
      valid: [
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Examples

Here are some examples of the style.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

## Example

Here is an example of the style.`,
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

### EXAMPLES

Here are some examples.`,
        },
        {
          filePath: '.claude/output_styles/test-style/README.md',
          content: `---
name: test-style
---

No examples here.`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---

# Guidelines

Some guidelines without examples section.`,
          errors: [{ message: 'should include an "Examples" section' }],
        },
        {
          filePath: '.claude/output_styles/test-style/OUTPUT_STYLE.md',
          content: `---
name: test-style
description: Test output style
---
`,
          errors: [{ message: 'should include an "Examples" section' }],
        },
      ],
    });
  });
});
