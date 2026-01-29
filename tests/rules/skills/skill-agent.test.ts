/**
 * Tests for skill-agent rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-agent';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-agent', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-agent', rule, {
      valid: [
        // Agent specified when context is fork
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: fork\nagent: my-agent\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No agent needed when context is inline
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: inline\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No context field
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Context is fork but no agent specified
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: fork\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'agent field is required',
            },
          ],
        },
      ],
    });
  });
});
