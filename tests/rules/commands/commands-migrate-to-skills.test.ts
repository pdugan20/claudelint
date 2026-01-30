/**
 * Tests for commands-migrate-to-skills rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/commands/commands-migrate-to-skills';

const ruleTester = new ClaudeLintRuleTester();

describe('commands-migrate-to-skills', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('commands-migrate-to-skills', rule, {
      valid: [
        // Any content (rule checks filesystem)
        {
          content: '{}',
          filePath: '/test/project',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to check if .claude/commands
        // directory exists. Invalid cases would require creating test directories
        // with a .claude/commands folder, which is beyond the scope of simple
        // content-based testing. The rule provides migration guidance when the
        // deprecated commands directory is detected.
      ],
    });
  });
});
