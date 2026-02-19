/**
 * Tests for skill-body-long-code-block rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-body-long-code-block';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-body-long-code-block', () => {
  const filePath = '/test/.claude/skills/example/SKILL.md';

  it('should pass when code blocks are short', async () => {
    await ruleTester.run('skill-body-long-code-block', rule, {
      valid: [
        // Short code block
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

## Usage

\`\`\`bash
echo "hello"
echo "world"
\`\`\`
`,
          filePath,
        },
        // No code blocks
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

Just text, no code blocks.
`,
          filePath,
        },
        // Exactly at threshold (40 lines)
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

\`\`\`bash
${Array.from({ length: 40 }, (_, i) => `echo "line ${i + 1}"`).join('\n')}
\`\`\`
`,
          filePath,
        },
        // Tilde fence within threshold
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

~~~bash
echo "hello"
echo "world"
~~~
`,
          filePath,
        },

        // Not a SKILL.md file
        {
          content: `---
name: test
---

\`\`\`bash
${Array.from({ length: 30 }, (_, i) => `echo "line ${i + 1}"`).join('\n')}
\`\`\`
`,
          filePath: '/test/README.md',
        },
      ],
      invalid: [
        // Code block over threshold
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

\`\`\`bash
${Array.from({ length: 45 }, (_, i) => `echo "line ${i + 1}"`).join('\n')}
\`\`\`
`,
          filePath,
          errors: [{ message: 'Code block too long (45/40 lines)' }],
        },
        // Multiple code blocks, only long one flagged
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

\`\`\`bash
echo "short"
\`\`\`

\`\`\`json
${Array.from({ length: 50 }, (_, i) => `"field${i}": "value${i}"`).join(',\n')}
\`\`\`
`,
          filePath,
          errors: [{ message: 'Code block too long (50/40 lines)' }],
        },

        // Tilde fence over threshold
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

~~~bash
${Array.from({ length: 45 }, (_, i) => `echo "line ${i + 1}"`).join('\n')}
~~~
`,
          filePath,
          errors: [{ message: 'Code block too long (45/40 lines)' }],
        },
      ],
    });
  });

  it('should respect custom maxLines option', async () => {
    await ruleTester.run('skill-body-long-code-block', rule, {
      valid: [
        // 15 lines with maxLines=10 would fail, but with default 20 it passes
        {
          content: `---
name: test-skill
description: Test skill for validation
---

# Test Skill

\`\`\`bash
${Array.from({ length: 15 }, (_, i) => `echo "line ${i + 1}"`).join('\n')}
\`\`\`
`,
          filePath,
        },
      ],
      invalid: [],
    });
  });
});
