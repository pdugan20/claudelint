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
dependencies:
  - npm:some-package
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
              message:
                'Unknown frontmatter key "author". Valid keys: agent, allowed-tools, context, dependencies, description, model, name, tags, version',
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
license: MIT
---

# My Skill`,
          errors: [
            {
              message:
                'Unknown frontmatter key "author". Valid keys: agent, allowed-tools, context, dependencies, description, model, name, tags, version',
            },
            {
              message:
                'Unknown frontmatter key "license". Valid keys: agent, allowed-tools, context, dependencies, description, model, name, tags, version',
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
dependencies:
  - npm:claude-code-lint
---

# My Skill`,
        },
      ],
      invalid: [],
    });
  });
});
