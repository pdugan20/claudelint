/**
 * Tests for skill-model rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-model';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-model', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-model', rule, {
      valid: [
        // Valid model names
        {
          content: '---\nname: my-skill\ndescription: Test skill\nmodel: sonnet\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        {
          content: '---\nname: my-skill\ndescription: Test skill\nmodel: haiku\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        {
          content: '---\nname: my-skill\ndescription: Test skill\nmodel: opus\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No model field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Invalid model name
        {
          content: '---\nname: my-skill\ndescription: Test skill\nmodel: gpt-4\n---\n# Skill',
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
