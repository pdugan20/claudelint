/**
 * Tests for skill-body-word-count rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-body-word-count';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-body-word-count', () => {
  it('should pass for skills under word limit', async () => {
    await ruleTester.run('skill-body-word-count', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

# My Skill

This is a short skill body with only a few words.`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn when body exceeds 5000 words', async () => {
    // Generate body with 5001 words
    const words = Array(5001).fill('word').join(' ');

    await ruleTester.run('skill-body-word-count', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
---

${words}`,
          errors: [
            {
              message: 'Body too long (5001/5000 words)',
            },
          ],
        },
      ],
    });
  });

  it('should not count frontmatter words', async () => {
    // Frontmatter has many words but body is short
    await ruleTester.run('skill-body-word-count', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: This is a very long description with many many words that should not be counted toward the body word limit
tags:
  - tag1
  - tag2
  - tag3
---

# My Skill

Short body.`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-body-word-count', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: Array(6000).fill('word').join(' '),
        },
      ],
      invalid: [],
    });
  });
});
