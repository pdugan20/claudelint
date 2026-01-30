/**
 * Tests for commands-in-plugin-deprecated rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/commands-in-plugin-deprecated';

const ruleTester = new ClaudeLintRuleTester();

describe('commands-in-plugin-deprecated', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('commands-in-plugin-deprecated', rule, {
      valid: [
        // No commands field
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          filePath: '/test/plugin.json',
        },

        // Empty commands array
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            commands: [],
          }),
          filePath: '/test/plugin.json',
        },

        // Using skills instead
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            skills: ['my-skill'],
          }),
          filePath: '/test/plugin.json',
        },

        // Not a plugin.json file
        {
          content: JSON.stringify({
            commands: ['test-command'],
          }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Has commands
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            commands: ['test-command'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'commands" field in plugin.json is deprecated',
            },
          ],
        },

        // Multiple commands
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            commands: ['command-1', 'command-2', 'command-3'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'commands" field in plugin.json is deprecated',
            },
          ],
        },

        // Has both commands and skills
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            commands: ['old-command'],
            skills: ['new-skill'],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'commands" field in plugin.json is deprecated',
            },
          ],
        },
      ],
    });
  });
});
