/**
 * Tests for agent-tools rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-tools';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-tools', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-tools', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\ntools:\n  - Bash\n  - Read\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\ntools:\n  - Bash\ndisallowedTools:\n  - Edit\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'both tools and disallowedTools' }],
        },
      ],
    });
  });
});
