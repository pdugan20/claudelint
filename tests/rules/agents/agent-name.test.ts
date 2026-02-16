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
          filePath: '/test/agents/my-agent.md',
        },
        {
          content: '---\nname: api-helper\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/api-helper.md',
        },
        {
          content: '---\nname: a\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/a.md',
        },
        {
          content: '---\nname: 123-agent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/123-agent.md',
        },
        {
          content: '---\nname: -leading-hyphen\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/-leading-hyphen.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: MyAgent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/MyAgent.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
        {
          content: '---\nname: my_agent\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/my_agent.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
        {
          content: '---\nname: agent with spaces\ndescription: Test agent for validation\n---\n# Agent',
          filePath: '/test/agents/agent-spaces.md',
          errors: [{ message: 'lowercase letters, numbers, and hyphens' }],
        },
      ],
    });
  });
});
