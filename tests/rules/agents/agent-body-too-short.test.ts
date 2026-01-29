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
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

# System Prompt

This is a detailed agent with substantial body content that provides comprehensive instructions and guidance for the agent's behavior and capabilities.`,
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          options: { minLength: 20 },
          content: `---
name: test-agent
description: Test agent
---

This is long enough.`,
        },
        {
          filePath: '.claude/agents/test-agent/README.md',
          content: `---
name: test-agent
---

Short`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

Short body.`,
          errors: [{ message: 'Agent body content is very short' }],
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          options: { minLength: 100 },
          content: `---
name: test-agent
description: Test agent
---

This is a medium-length body that is longer than 50 characters.`,
          errors: [{ message: 'minimum: 100' }],
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---
`,
          errors: [{ message: 'Agent body content is very short' }],
        },
      ],
    });
  });
});
