/**
 * Tests for skill-dependencies rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-dependencies';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-dependencies', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-dependencies', rule, {
      valid: [
        // Valid dependencies array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ndependencies:\n  - other-skill\n  - helper-skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No dependencies field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Not an array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ndependencies: other-skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
          errors: [
            {
              message: 'array',
            },
          ],
        },
      ],
    });
  });
});
