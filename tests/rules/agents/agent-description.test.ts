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
          filePath: '/test/agents/my-agent.md',
        },
        {
          content:
            '---\nname: my-agent\ndescription: >\n  Use this agent when the user wants help.\n\n  <example>\n  user: "Help me"\n  </example>\n---\n# Agent',
          filePath: '/test/agents/my-agent.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Too short\n---\n# Agent',
          filePath: '/test/agents/my-agent.md',
          errors: [{ message: 'at least 10 characters' }],
        },
      ],
    });
  });
});
