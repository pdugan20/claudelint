/**
 * Tests for agent-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-name';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-name', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: api-helper\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: MyAgent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
        {
          content: '---\nname: my_agent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
      ],
    });
  });
});
