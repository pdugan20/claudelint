/**
 * Tests for agent-name-filename-mismatch rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-name-filename-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-name-filename-mismatch', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-name-filename-mismatch', rule, {
      valid: [
        {
          content: '---\nname: code-reviewer\ndescription: Reviews code\n---\n# Agent',
          filePath: '/path/to/.claude/agents/code-reviewer.md',
        },
        {
          content: '---\nname: test-agent\ndescription: Tests things\n---\n# Agent',
          filePath: '.claude/agents/test-agent.md',
        },
        {
          content: '---\nname: bug-finder\ndescription: Finds bugs\n---\n# Agent',
          filePath: '/Users/test/.claude/agents/bug-finder.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: wrong-name\ndescription: Reviews code\n---\n# Agent',
          filePath: '/path/to/.claude/agents/code-reviewer.md',
          errors: [
            {
              message: 'Agent name "wrong-name" does not match filename "code-reviewer"',
            },
          ],
        },
        {
          content: '---\nname: testAgent\ndescription: Tests things\n---\n# Agent',
          filePath: '.claude/agents/test-agent.md',
          errors: [
            {
              message: 'Agent name "testAgent" does not match filename "test-agent"',
            },
          ],
        },
      ],
    });
  });
});
