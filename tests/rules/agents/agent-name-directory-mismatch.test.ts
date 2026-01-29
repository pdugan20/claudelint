/**
 * Tests for agent-name-directory-mismatch rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-name-directory-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-name-directory-mismatch', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-name-directory-mismatch', rule, {
      valid: [
        {
          content: '---\nname: code-reviewer\ndescription: Reviews code\n---\n# Agent',
          filePath: '/path/to/.claude/agents/code-reviewer/AGENT.md',
        },
        {
          content: '---\nname: test-agent\ndescription: Tests things\n---\n# Agent',
          filePath: '.claude/agents/test-agent/AGENT.md',
        },
        {
          content: '---\nname: bug-finder\ndescription: Finds bugs\n---\n# Agent',
          filePath: '/Users/test/.claude/agents/bug-finder/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: wrong-name\ndescription: Reviews code\n---\n# Agent',
          filePath: '/path/to/.claude/agents/code-reviewer/AGENT.md',
          errors: [
            {
              message: 'Agent name "wrong-name" does not match directory name "code-reviewer"',
            },
          ],
        },
        {
          content: '---\nname: testAgent\ndescription: Tests things\n---\n# Agent',
          filePath: '.claude/agents/test-agent/AGENT.md',
          errors: [
            {
              message: 'Agent name "testAgent" does not match directory name "test-agent"',
            },
          ],
        },
      ],
    });
  });
});
