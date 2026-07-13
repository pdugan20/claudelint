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
        {
          // The comma-separated string form, straight from docs-baseline/sub-agents.md:247.
          // claudelint demanded a YAML array, so the docs' own canonical agent failed to lint.
          content: '---\nname: code-reviewer\ndescription: Test agent\ntools: Read, Glob, Grep\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          // tools + disallowedTools together: documented, not mutually exclusive
          // (docs-baseline/sub-agents.md:342).
          content: '---\nname: my-agent\ndescription: Test agent\ntools:\n  - Bash\ndisallowedTools:\n  - Edit\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          // A tool list must still be a string or a list -- not a number.
          content: '---\nname: my-agent\ndescription: Test agent\ntools: 42\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'Invalid input' }],
        },
      ],
    });
  });
});
