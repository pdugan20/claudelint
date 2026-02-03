/**
 * Tests for agent-disallowed-tools rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-disallowed-tools';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-disallowed-tools', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-disallowed-tools', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\ndisallowedTools:\n  - Bash\n  - Edit\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\ndisallowedTools: Bash\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'array' }],
        },
      ],
    });
  });
});
