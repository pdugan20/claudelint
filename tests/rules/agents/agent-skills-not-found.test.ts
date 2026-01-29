/**
 * Tests for agent-skills-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-skills-not-found';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-skills-not-found', () => {
  it('should pass when no skills specified', async () => {
    await ruleTester.run('agent-skills-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/agents/my-agent.md',
          content: `---
name: my-agent
description: Test agent
---

# System Prompt

This agent has no skills.`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-agent files', async () => {
    await ruleTester.run('agent-skills-not-found', rule, {
      valid: [
        {
          filePath: '/test/random-file.md',
          content: `---
skills:
  - does-not-exist
---`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip files not in .claude/agents/', async () => {
    await ruleTester.run('agent-skills-not-found', rule, {
      valid: [
        {
          filePath: '/test/agents/my-agent.md',
          content: `---
skills:
  - does-not-exist
---`,
        },
      ],
      invalid: [],
    });
  });

  it('should handle empty skills array', async () => {
    await ruleTester.run('agent-skills-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/agents/my-agent.md',
          content: `---
name: my-agent
skills: []
---`,
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-string skill values', async () => {
    await ruleTester.run('agent-skills-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/agents/my-agent.md',
          content: `---
name: my-agent
skills:
  - 123
  - true
---`,
        },
      ],
      invalid: [],
    });
  });

  // Note: Testing actual file existence requires integration tests with real filesystem
  // or complex mocking. The rule logic is tested here, filesystem interaction tested separately.
});
