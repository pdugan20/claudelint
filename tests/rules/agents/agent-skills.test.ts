/**
 * Tests for agent-skills rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-skills';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-skills', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-skills', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nskills:\n  - skill-one\n  - skill-two\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nskills: skill-one\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'array' }],
        },
      ],
    });
  });
});
