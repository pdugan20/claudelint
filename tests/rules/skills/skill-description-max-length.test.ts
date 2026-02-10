/**
 * Tests for skill-description-max-length rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-description-max-length';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-description-max-length', () => {
  it('should pass for short descriptions', async () => {
    await ruleTester.run('skill-description-max-length', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A concise skill description.
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn for descriptions exceeding 1024 characters', async () => {
    const longDescription = 'A'.repeat(1025);

    await ruleTester.run('skill-description-max-length', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: ${longDescription}
---

# My Skill`,
          errors: [
            {
              message: `Skill description is 1025 characters (max: 1024). Shorten the description for better readability in skill listings.`,
            },
          ],
        },
      ],
    });
  });

  it('should pass for exactly 1024 characters', async () => {
    const exactDescription = 'B'.repeat(1024);

    await ruleTester.run('skill-description-max-length', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: ${exactDescription}
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip files without frontmatter', async () => {
    await ruleTester.run('skill-description-max-length', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: '# My Skill\n\nNo frontmatter here.',
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-description-max-length', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: `---
name: my-skill
description: ${'X'.repeat(600)}
---`,
        },
      ],
      invalid: [],
    });
  });
});
