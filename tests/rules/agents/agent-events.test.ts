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
          content: '---\nname: my-agent\ndescription: Test agent\nevents:\n  - onStart\n  - onComplete\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nevents:\n  - onStart\n  - onComplete\n  - onError\n  - onCancel\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'more than 3 items' }],
        },
      ],
    });
  });
});
