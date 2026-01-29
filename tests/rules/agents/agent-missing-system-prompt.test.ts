/**
 * Tests for agent-missing-system-prompt rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-missing-system-prompt';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-missing-system-prompt', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-missing-system-prompt', rule, {
      valid: [
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

# System Prompt

Detailed instructions for the agent.`,
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

## System Prompt

Detailed instructions for the agent.`,
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

## SYSTEM PROMPT

Detailed instructions for the agent.`,
        },
        {
          filePath: '.claude/agents/test-agent/README.md',
          content: `---
name: test-agent
---

No system prompt here.`,
        },
      ],
      invalid: [
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---

# Instructions

Some other content without system prompt section.`,
          errors: [{ message: 'should include a "System Prompt" section' }],
        },
        {
          filePath: '.claude/agents/test-agent/AGENT.md',
          content: `---
name: test-agent
description: Test agent
---
`,
          errors: [{ message: 'should include a "System Prompt" section' }],
        },
      ],
    });
  });
});
