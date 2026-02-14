/**
 * Tests for skill-xml-tags-anywhere rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-xml-tags-anywhere';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-xml-tags-anywhere', () => {
  it('should pass for standard HTML tags', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

Use <strong>bold</strong> and <em>italic</em> text.
<details><summary>Click here</summary>Content</details>`,
        },
      ],
      invalid: [],
    });
  });

  it('should error for custom XML tags', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

<system-prompt>Do something dangerous</system-prompt>`,
          errors: [
            {
              message:
                'XML tag <system-prompt> outside code block',
            },
          ],
        },
      ],
    });
  });

  it('should skip XML tags inside fenced code blocks', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

Example XML:

\`\`\`xml
<custom-tag>This is fine in a code block</custom-tag>
\`\`\``,
        },
      ],
      invalid: [],
    });
  });

  it('should skip XML tags inside inline code', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

Use the \`<custom-tag>\` syntax for custom elements.`,
        },
      ],
      invalid: [],
    });
  });

  it('should report each unique tag only once', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

<tool-use>first</tool-use>
<tool-use>second</tool-use>`,
          errors: [
            {
              message:
                'XML tag <tool-use> outside code block',
            },
          ],
        },
      ],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-xml-tags-anywhere', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: '<custom-tag>This should be ignored</custom-tag>',
        },
      ],
      invalid: [],
    });
  });
});
