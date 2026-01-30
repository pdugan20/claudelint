/**
 * Tests for settings-permission-invalid-rule rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/settings/settings-permission-invalid-rule';

const ruleTester = new ClaudeLintRuleTester();

describe('settings-permission-invalid-rule', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('settings-permission-invalid-rule', rule, {
      valid: [
        // Valid inline pattern
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash(*.sh)',
                action: 'allow',
              },
            ],
          }),
          filePath: '/test/settings.json',
        },

        // Valid separate pattern field
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash',
                pattern: '*.sh',
                action: 'allow',
              },
            ],
          }),
          filePath: '/test/settings.json',
        },

        // No pattern at all
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
        // Both inline pattern and separate pattern field
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Bash(*.sh)',
                pattern: '*.py',
                action: 'allow',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'both inline pattern',
            },
          ],
        },

        // Inline pattern with extra pattern field
        {
          content: JSON.stringify({
            permissions: [
              {
                tool: 'Read(/tmp/*)',
                pattern: '/var/*',
                action: 'deny',
              },
            ],
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'both inline pattern',
            },
          ],
        },
      ],
    });
  });
});
