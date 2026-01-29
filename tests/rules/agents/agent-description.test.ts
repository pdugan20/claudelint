/**
 * Tests for agent-description rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-description';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-description', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-description', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Validates Claude configuration files\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Too short\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'at least 10 characters' }],
        },
        {
          content: '---\nname: my-agent\ndescription: I validate Claude files\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'third person' }],
        },
      ],
    });
  });
});
