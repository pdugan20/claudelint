/**
 * Tests for settings-invalid-permission rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/settings/settings-invalid-permission';

const ruleTester = new ClaudeLintRuleTester();

describe('settings-invalid-permission', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('settings-invalid-permission', rule, {
      valid: [
        // Valid 'allow' action
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash',
                action: 'allow',
              },
            ],
          }),
          filePath: '/test/settings.json',
        },

        // Valid 'deny' action
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Read',
                action: 'deny',
              },
            ],
          }),
          filePath: '/test/settings.json',
        },

        // Valid 'ask' action
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Write',
                action: 'ask',
              },
            ],
          }),
          filePath: '/test/settings.json',
        },

        // Not a settings.json file
        {
          content: JSON.stringify({ permissions: [] }),
          filePath: '/test/config.json',
        },

        // No permissions field
        {
          content: JSON.stringify({ env: {} }),
          filePath: '/test/settings.json',
        },
      ],

      invalid: [
        // Invalid action: 'reject'
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash',
                action: 'reject',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid permission action',
            },
          ],
        },

        // Invalid action: 'accept'
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Read',
                action: 'accept',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid permission action',
            },
          ],
        },

        // Invalid action: random string
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Write',
                action: 'maybe',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid permission action',
            },
          ],
        },

        // Multiple invalid actions
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash',
                action: 'enable',
              },
              {
                tool: 'Read',
                action: 'disable',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid permission action',
            },
            {
              message: 'Invalid permission action',
            },
          ],
        },
      ],
    });
  });
});
