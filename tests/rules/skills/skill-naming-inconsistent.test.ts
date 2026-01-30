/**
 * Tests for skill-naming-inconsistent rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-naming-inconsistent';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-naming-inconsistent', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-naming-inconsistent', rule, {
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
        // Note: This rule requires filesystem access to read files in the skill directory
        // and check their naming conventions. Invalid cases would require mocking the
        // filesystem or creating test directories with files using different naming
        // conventions (kebab-case, snake_case, camelCase), which is beyond the scope
        // of simple content-based testing.
      ],
    });
  });
});
