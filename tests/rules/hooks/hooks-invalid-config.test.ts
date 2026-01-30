/**
 * Tests for hooks-invalid-config rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/hooks/hooks-invalid-config';

const ruleTester = new ClaudeLintRuleTester();

describe('hooks-invalid-config', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('hooks-invalid-config', rule, {
      valid: [
        // Valid command hook
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

        // Valid prompt hook
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PermissionRequest',
                type: 'prompt',
                prompt: 'Are you sure you want to push?',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid agent hook
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PostToolUse',
                type: 'agent',
                agent: 'my-agent',
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with valid regex matcher
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PreToolUse',
                type: 'command',
                command: 'npm test',
                matcher: {
                  pattern: '.*\\.ts$',
                },
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
      ],

      invalid: [
        // Invalid hook type
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'pre-commit',
                type: 'script',
                command: 'npm test',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Invalid hook type',
            },
          ],
        },

        // Command hook missing command field
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PreToolUse',
                type: 'command',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'must have "command" field',
            },
          ],
        },

        // Prompt hook missing prompt field
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PermissionRequest',
                type: 'prompt',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'must have "prompt" field',
            },
          ],
        },

        // Agent hook missing agent field
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PostToolUse',
                type: 'agent',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'must have "agent" field',
            },
          ],
        },

        // Invalid regex pattern
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PreToolUse',
                type: 'command',
                command: 'npm test',
                matcher: {
                  pattern: '[invalid(regex',
                },
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Invalid regex pattern',
            },
          ],
        },

        // Multiple validation errors
        {
          content: JSON.stringify({
            hooks: [
              {
                event: 'PreToolUse',
                type: 'invalid-type',
                command: 'test',
              },
              {
                event: 'PostToolUse',
                type: 'command',
              },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            {
              message: 'Invalid hook type',
            },
            {
              message: 'must have "command" field',
            },
          ],
        },
      ],
    });
  });
});
