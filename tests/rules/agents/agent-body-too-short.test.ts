/**
 * Tests for agent-body-too-short rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-body-too-short';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-body-too-short', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-body-too-short', rule, {
      valid: [
        {
          filePath: '.claude/agents/test-agent.md',
          content: `---
name: test-agent
description: Test agent
---

This is a detailed agent with substantial body content that provides comprehensive instructions and guidance for the agent's behavior and capabilities.`,
        },
        {
          filePath: '.claude/agents/test-agent.md',
          options: { minLength: 20 },
          content: `---
name: test-agent
description: Test agent
---

This is long enough.`,
        },
        {
          filePath: '.claude/agents/test-agent.json',
          content: `---
name: test-agent
---

Short`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/agents/test-agent.md',
          content: `---
name: test-agent
description: Test agent
---

Short body.`,
          errors: [{ message: 'Body too short' }],
        },
        {
          filePath: '.claude/agents/test-agent.md',
          options: { minLength: 100 },
          content: `---
name: test-agent
description: Test agent
---

This is a medium-length body that is longer than 50 characters.`,
          errors: [{ message: '/100 characters)' }],
        },
        {
          filePath: '.claude/agents/test-agent.md',
          content: `---
name: test-agent
description: Test agent
---
`,
          errors: [{ message: 'Body too short' }],
        },
      ],
    });
  });
});
