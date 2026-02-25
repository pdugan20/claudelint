/**
 * Tests for skill-frontmatter-unknown-keys rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-frontmatter-unknown-keys';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-frontmatter-unknown-keys', () => {
  it('should pass for valid frontmatter keys', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
version: 1.0.0
tags:
  - test
allowed-tools:
  - Bash
  - Read
model: sonnet
context:
  - file.md
agent: my-agent
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should warn for unknown keys', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
author: John Doe
---

# My Skill`,
          errors: [
            {
              message: 'Unknown frontmatter key: "author"',
            },
          ],
        },
      ],
    });
  });

  it('should warn for multiple unknown keys', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
author: John Doe
priority: high
---

# My Skill`,
          errors: [
            {
              message: 'Unknown frontmatter key: "author"',
            },
            {
              message: 'Unknown frontmatter key: "priority"',
            },
          ],
        },
      ],
    });
  });

  it('should skip files without frontmatter', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: '# My Skill\n\nNo frontmatter.',
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-SKILL.md files', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/README.md',
          content: `---
unknown-key: value
---

# Readme`,
        },
      ],
      invalid: [],
    });
  });

  it('should pass for all official keys', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
argument-hint: Pass a file path
disable-model-invocation: true
user-invocable: true
hooks:
  PreToolUse:
    - command: echo check
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should pass for Anthropic guide fields (license, compatibility, metadata)', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
license: MIT
compatibility: ">=1.0.0"
metadata:
  category: testing
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });

  it('should not flag nested keys as unknown', async () => {
    await ruleTester.run('skill-frontmatter-unknown-keys', rule, {
      valid: [
        {
          filePath: '/test/.claude/skills/my-skill/SKILL.md',
          content: `---
name: my-skill
description: A test skill
tags:
  - automation
  - claude-code
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });
});
