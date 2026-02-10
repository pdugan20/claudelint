/**
 * Tests for hooks-invalid-config rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/hooks/hooks-invalid-config';

const ruleTester = new ClaudeLintRuleTester();

/** Helper to create hooks.json content in object-keyed format */
function hooksJson(hooks: Record<string, unknown>): string {
  return JSON.stringify({ hooks });
}

describe('hooks-invalid-config', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('hooks-invalid-config', rule, {
      valid: [
        // Valid command hook
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid prompt hook
        {
          content: hooksJson({
            PermissionRequest: [
              { hooks: [{ type: 'prompt', prompt: 'Are you sure you want to push?' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Valid agent hook
        {
          content: hooksJson({
            PostToolUse: [
              { hooks: [{ type: 'agent', agent: 'my-agent' }] },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with matcher
        {
          content: hooksJson({
            PreToolUse: [
              {
                matcher: 'Bash',
                hooks: [{ type: 'command', command: 'npm test' }],
              },
            ],
          }),
          filePath: '/test/hooks.json',
        },

        // Hook with valid timeout
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test', timeout: 30000 }] },
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
        // Invalid hook type
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'script', command: 'npm test' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Invalid hook type' },
          ],
        },

        // Command hook missing command field
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'must have "command" field' },
          ],
        },

        // Prompt hook missing prompt field
        {
          content: hooksJson({
            PermissionRequest: [
              { hooks: [{ type: 'prompt' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'must have "prompt" field' },
          ],
        },

        // Agent hook missing agent field
        {
          content: hooksJson({
            PostToolUse: [
              { hooks: [{ type: 'agent' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'must have "agent" field' },
          ],
        },

        // Mutual exclusivity: command + prompt
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test', prompt: 'extra' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'cannot have multiple handler fields' },
          ],
        },

        // Invalid timeout: zero
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test', timeout: 0 }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Invalid timeout value' },
          ],
        },

        // Invalid timeout: negative
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'command', command: 'npm test', timeout: -100 }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Invalid timeout value' },
          ],
        },

        // Multiple validation errors
        {
          content: hooksJson({
            PreToolUse: [
              { hooks: [{ type: 'invalid-type', command: 'test' }] },
            ],
            PostToolUse: [
              { hooks: [{ type: 'command' }] },
            ],
          }),
          filePath: '/test/hooks.json',
          errors: [
            { message: 'Invalid hook type' },
            { message: 'must have "command" field' },
          ],
        },
      ],
    });
  });
});
