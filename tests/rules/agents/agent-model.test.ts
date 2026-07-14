/**
 * Tests for agent-model rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/agents/agent-model';

const ruleTester = new ClaudeLintRuleTester();

describe('agent-model', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('agent-model', rule, {
      valid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: sonnet\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: haiku\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: inherit\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        {
          content:
            '---\nname: my-agent\ndescription: Test agent\nmodel: claude-opus-4-6\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
        // docs-baseline/sub-agents.md:290 lists the aliases as
        // "sonnet, opus, haiku, or fable"
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: fable\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
        },
      ],

      invalid: [
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: gpt-4\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'Unrecognized model' }],
        },
        {
          content: '---\nname: my-agent\ndescription: Test agent\nmodel: Sonnet\n---\n# Agent',
          filePath: '/test/agents/AGENT.md',
          errors: [{ message: 'Unrecognized model' }],
        },
      ],
    });
  });
});
