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
        // Valid tool names in allow
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash', 'Read', 'Write'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid tool names in deny
        {
          content: JSON.stringify({
            permissions: {
              deny: ['Bash(curl *)', 'WebFetch'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid tool names in ask
        {
          content: JSON.stringify({
            permissions: {
              ask: ['Write', 'Edit'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid MCP server reference
        {
          content: JSON.stringify({
            permissions: {
              allow: ['mcp__myserver'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid tool with pattern
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash(npm run *)'],
            },
          }),
          filePath: '/test/settings.json',
        },

        // Not a settings.json file
        {
          content: JSON.stringify({
            permissions: { allow: ['InvalidTool'] },
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
        // Invalid tool name in allow
        {
          content: JSON.stringify({
            permissions: {
              allow: ['InvalidTool'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid tool name',
            },
          ],
        },

        // Invalid tool name in deny
        {
          content: JSON.stringify({
            permissions: {
              deny: ['FakeTool(pattern)'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid tool name',
            },
          ],
        },

        // Invalid tool name in ask
        {
          content: JSON.stringify({
            permissions: {
              ask: ['NotARealTool'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid tool name',
            },
          ],
        },

        // Multiple invalid tool names
        {
          content: JSON.stringify({
            permissions: {
              allow: ['Bash', 'InvalidTool1'],
              deny: ['BadTool'],
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Invalid tool name',
            },
            {
              message: 'Invalid tool name',
            },
          ],
        },
      ],
    });
  });
});
