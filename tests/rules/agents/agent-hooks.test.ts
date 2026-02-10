/**
 * Tests for agent-hooks rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-hooks';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-hooks', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-hooks', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent that validates code\nhooks:\n  SessionStart:\n    - hooks:\n        - type: command\n          command: echo "Starting"\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent that validates code\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent that validates code\nhooks: invalid\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'expected object' }],
        },
      ],
    });
  });
});
