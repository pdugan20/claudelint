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
        // Valid Tool format
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash', 'Read', 'Write'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid Tool(pattern) format
        {
          content: JSON.stringify({
            permissions: {
              deny: ['Bash(curl *)', 'Read(.env)'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid complex patterns
        {
          content: JSON.stringify({
            permissions: {
              allow: [
                'Bash(npm run *)',
                'Read(~/Documents/*.pdf)',
                'WebFetch(domain:example.com)',
              ],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Not a settings.json file
        {
          content: JSON.stringify({
            permissions: { allow: ['Invalid((()'] },
          }),
          filePath: '/test/config.json',
        },

        // No permissions field
        {
          content: JSON.stringify({ env: {} }),
          filePath: '/test/settings.json',
        },
      ],

      invalid: [
        // Unmatched opening parenthesis
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash(npm run'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Unmatched parentheses',
            },
          ],
        },

        // Unmatched closing parenthesis
        {
          content: JSON.stringify({
            permissions: {
              deny: ['Read)test)'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Unmatched parentheses',
            },
          ],
        },

        // Empty permission rule
        {
          content: JSON.stringify({
            permissions: {
              ask: [''],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Empty permission rule',
            },
          ],
        },

        // Invalid format with multiple unmatched parens
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash((test)'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Unmatched parentheses',
            },
          ],
        },

        // Multiple invalid rules
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash(npm run', 'Read)file)'],
              deny: [''],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Unmatched parentheses',
            },
            {
              message: 'Unmatched parentheses',
            },
            {
              message: 'Empty permission rule',
            },
          ],
        },
      ],
    });
  });
});
