/**
 * Tests for skill-tags rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-tags';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-tags', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-tags', rule, {
      valid: [
        // Valid tags array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ntags:\n  - validation\n  - linting\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
        // No tags field (optional)
        {
          content: '---\nname: my-skill\ndescription: Test skill\n---\n# Skill',
          filePath: '/test/SKILL.md',
        },
      ],

      invalid: [
        // Not an array
        {
          content: '---\nname: my-skill\ndescription: Test skill\ntags: validation\n---\n# Skill',
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
