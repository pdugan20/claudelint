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
          // The bare string form is documented: "Accepts a space- or comma-separated
          // string, or a YAML list" (docs-baseline/skills.md:236). This test previously
          // asserted the OPPOSITE -- that a bare string is an error.
          content: '---\nname: my-agent\ndescription: Test agent\ndisallowedTools: Bash, Write\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent\ndisallowedTools:\n  - Bash\n  - Edit\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          // Still must be a string or a list -- a number is not a tool list.
          content: '---\nname: my-agent\ndescription: Test agent\ndisallowedTools: 42\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'Invalid input' }],
        },
      ],
    });
  });
});
