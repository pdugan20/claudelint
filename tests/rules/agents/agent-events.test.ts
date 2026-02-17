/**
 * Tests for agent-events rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-events';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-events', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-events', rule, {
      valid: [
        {
          content:
            '---\nname: my-agent\ndescription: Test agent for validation\nevents:\n  - on_error\n---\n# Agent',
          filePath: '/test/agents/my-agent.md',
        },
        {
          content:
            '---\nname: my-agent\ndescription: Test agent for validation\nevents:\n  - on_error\n  - on_success\n  - on_timeout\n---\n# Agent',
          filePath: '/test/agents/my-agent.md',
        },
      ],

      invalid: [],
    });
  });
});
