/**
 * Tests for agent-model rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-model';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-model', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-model', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: sonnet\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: haiku\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: gpt-4\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'Invalid' }],
        },
      ],
    });
  });
});
