/**
 * Tests for hooks-invalid-event rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/hooks/hooks-invalid-event';

const ruleTester = new ClaudeLintRuleTester();

/** Helper to create hooks.json content in object-keyed format */
function hooksJson(hooks: Record<string, unknown>): string {
  return JSON.stringify({ hooks });
}

describe('hooks-invalid-event', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('hooks-invalid-event', rule, {
      valid: [
        // Valid PreToolUse event
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid PostToolUse event
        {
          content: hooksJson({
            PostToolUse: [
              { hooks: [{ type: 'command', command: 'echo "Done"' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid SessionStart event
        {
          content: hooksJson({
            SessionStart: [
              { hooks: [{ type: 'command', command: 'npm run build' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // No hooks object
        {
          content: JSON.stringify({}),
          filePath: '/test/hooks.json',
        },

        // Empty hooks object
        {
          content: hooksJson({}),
          filePath: '/test/hooks.json',
        },
      ],

      invalid: [
        // Invalid event name
        {
          content: hooksJson({
            'before-commit': [
              { hooks: [{ type: 'command', command: 'npm test' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Unknown hook event' },
          ],
        },

        // Typo in event name
        {
          content: hooksJson({
            'pre-comit': [
              { hooks: [{ type: 'command', command: 'npm test' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Unknown hook event' },
          ],
        },

        // Custom event name
        {
          content: hooksJson({
            'my-custom-event': [
              { hooks: [{ type: 'command', command: 'echo "test"' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Unknown hook event' },
          ],
        },

        // Multiple invalid events
        {
          content: hooksJson({
            'invalid-event-1': [
              { hooks: [{ type: 'command', command: 'test1' }] },
            ],
            'invalid-event-2': [
              { hooks: [{ type: 'command', command: 'test2' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Unknown hook event' },
            { message: 'Unknown hook event' },
          ],
        },
      ],
    });
  });
});
