/**
 * Tests for hooks-missing-script rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/hooks/hooks-missing-script';

const ruleTester = new ClaudeLintRuleTester();

/** Helper to create hooks.json content in object-keyed format */
function hooksJson(hooks: Record<string, unknown>): string {
  return JSON.stringify({ hooks });
}

describe('hooks-missing-script', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('hooks-missing-script', rule, {
      valid: [
        // Hook with inline command (skipped validation)
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test && npm run lint' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with command containing variables
        {
          content: hooksJson({
            SessionStart: [
              { hooks: [{ type: 'command', command: '${SCRIPT_DIR}/test.sh' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with absolute path command (can't validate)
        {
          content: hooksJson({
            PostToolUse: [
              { hooks: [{ type: 'command', command: '/usr/local/bin/custom-script' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with prompt type (no command field)
        {
          content: hooksJson({
            PermissionRequest: [
              { hooks: [{ type: 'prompt', prompt: 'Are you sure?' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // No hooks object
        {
          content: JSON.stringify({}),
          filePath: '/test/hooks.json',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to check if relative path
        // scripts exist. Invalid cases would require creating test directories
        // with hooks.json files that reference non-existent scripts, which is
        // beyond the scope of simple content-based testing.
      ],
    });
  });
});
