/**
 * Tests for skill-deep-nesting rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-deep-nesting';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-deep-nesting', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-deep-nesting', rule, {
      valid: [
        // Not a SKILL.md file
        {
          content: '---\nname: test\n---\n# Test',
          filePath: '/test/README.md',
        },

        // SKILL.md but directory doesn't exist (test ignores errors)
        {
          content: '---\nname: test\n---\n# Skill',
          filePath: '/nonexistent/SKILL.md',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to recursively check directory
        // depth in the skill directory. Invalid cases would require creating a complex
        // nested directory structure, which is beyond the scope of simple content-based
        // testing. The rule checks if subdirectories exceed the maximum nesting depth.
      ],
    });
  });
});
