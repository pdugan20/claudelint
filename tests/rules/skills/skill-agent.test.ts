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
        {
          // `context: fork` does NOT require `agent`: the docs mark `agent` as
          // "Required: No" (docs-baseline/skills.md:241) and print exactly this skill at
          // skills.md:193. This case used to live in `invalid`.
          content: '---\nname: deploy\ndescription: Deploy the application to production\ncontext: fork\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // Agent specified when context is fork
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: fork\nagent: my-agent\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No agent needed when context is omitted
        {
          content: '---\nname: my-skill\ndescription: A skill that runs inline\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No context field
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
      ],
    });
  });
});
