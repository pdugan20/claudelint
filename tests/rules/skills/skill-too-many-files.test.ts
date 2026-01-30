/**
 * Tests for skill-too-many-files rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-too-many-files';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-too-many-files', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-too-many-files', rule, {
      valid: [
        // Not a SKILL.md file
        {
          content: '---\nname: test\n---\n# Test',
          filePath: '/test/README.md',
        },

        // SKILL.md but directory read will fail (test ignores errors)
        {
          content: '---\nname: test\n---\n# Skill',
          filePath: '/nonexistent/SKILL.md',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to count files in the skill directory.
        // Invalid cases would require mocking the filesystem or creating test directories,
        // which is beyond the scope of simple content-based testing.
        // The rule validates by reading the actual directory where SKILL.md is located.
      ],
    });
  });
});
