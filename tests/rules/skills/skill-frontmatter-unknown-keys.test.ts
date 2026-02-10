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
                'Unknown frontmatter key "author". Valid keys: agent, allowed-tools, argument-hint, compatibility, context, dependencies, description, disable-model-invocation, disallowed-tools, hooks, license, metadata, model, name, tags, user-invocable, version',
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
              message:
                'Unknown frontmatter key "author". Valid keys: agent, allowed-tools, argument-hint, compatibility, context, dependencies, description, disable-model-invocation, disallowed-tools, hooks, license, metadata, model, name, tags, user-invocable, version',
            },
            {
              message:
                'Unknown frontmatter key "priority". Valid keys: agent, allowed-tools, argument-hint, compatibility, context, dependencies, description, disable-model-invocation, disallowed-tools, hooks, license, metadata, model, name, tags, user-invocable, version',
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

  it('should pass for newly added official keys', async () => {
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
disallowed-tools:
  - Write
hooks:
  PreToolUse:
    - command: echo check
license: MIT
compatibility: Claude Code 1.0+
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
