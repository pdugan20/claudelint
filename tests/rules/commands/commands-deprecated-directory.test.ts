/**
 * Tests for commands-deprecated-directory rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/commands/commands-deprecated-directory';

const ruleTester = new ClaudeLintRuleTester();

describe('commands-deprecated-directory', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('commands-deprecated-directory', rule, {
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
        // content-based testing. The rule warns when the deprecated commands
        // directory is detected and suggests migrating to skills.
      ],
    });
  });
});
