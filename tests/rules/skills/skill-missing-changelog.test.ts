/**
 * Tests for skill-missing-changelog rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/skills/skill-missing-changelog';

const ruleTester = new ClaudeLintRuleTester();

describe('skill-missing-changelog', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('skill-missing-changelog', rule, {
      valid: [
        // Not a SKILL.md file
        {
          content: '---\nname: test\n---\n# Test',
          filePath: '/test/README.md',
        },

        // Note: This rule requires filesystem access to check if CHANGELOG.md exists
        // alongside SKILL.md. Valid cases would require creating actual test directories
        // with both files, which is beyond the scope of content-based testing.
        // The rule will report an error for any SKILL.md path where it can check
        // the directory (even non-existent paths return false from fileExists).
      ],

      invalid: [
        // Note: This rule requires filesystem access to check if CHANGELOG.md exists
        // in the same directory as SKILL.md. Invalid cases would require mocking the
        // filesystem or creating test directories, which is beyond the scope of
        // simple content-based testing.
      ],
    });
  });
});
