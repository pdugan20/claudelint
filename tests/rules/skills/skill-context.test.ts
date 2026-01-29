/**
 * Tests for skill-context rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-context';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-context', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-context', rule, {
      valid: [
        // Valid context modes
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: fork\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: inline\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: auto\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No context field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Invalid context mode
        {
          content: '---\nname: my-skill\ndescription: Test skill\ncontext: isolated\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'Invalid',
            },
          ],
        },
      ],
    });
  });
});
