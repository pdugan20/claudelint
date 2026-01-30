/**
 * Tests for hooks-invalid-event rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/hooks/hooks-invalid-event';

const ruleTester = new ClaudeLintRuleTester();

describe('hooks-invalid-event', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('hooks-invalid-event', rule, {
      valid: [
        // Valid PreToolUse event
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PreToolUse',
                type: 'command',
                command: 'npm test',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid PostToolUse event
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PostToolUse',
                type: 'command',
                command: 'echo "Done"',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid SessionStart event
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'SessionStart',
                type: 'command',
                command: 'npm run build',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // No hooks array
        {
          content: JSON.stringify({}),
          filePath: '/test/hooks.json',
        },

        // Hook without event field (handled by schema validation)
        {
          content: JSON.stringify({
            hooks: [
              {
                type: 'command',
                command: 'npm test',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },
      ],

      invalid: [
        // Invalid event name
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'before-commit',
                type: 'command',
                command: 'npm test',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Unknown hook event',
            },
          ],
        },

        // Typo in event name
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'pre-comit',
                type: 'command',
                command: 'npm test',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Unknown hook event',
            },
          ],
        },

        // Custom event name
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'my-custom-event',
                type: 'command',
                command: 'echo "test"',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Unknown hook event',
            },
          ],
        },

        // Multiple invalid events
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'invalid-event-1',
                type: 'command',
                command: 'test1',
              },
              {
                event: 'invalid-event-2',
                type: 'command',
                command: 'test2',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Unknown hook event',
            },
            {
              message: 'Unknown hook event',
            },
          ],
        },
      ],
    });
  });
});
