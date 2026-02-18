/**
 * Tests for plugin-hook-missing-plugin-root rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-hook-missing-plugin-root';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-hook-missing-plugin-root', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-hook-missing-plugin-root', rule, {
      valid: [
        // Hooks path using ${CLAUDE_PLUGIN_ROOT}
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: '${CLAUDE_PLUGIN_ROOT}/hooks/hooks.json',
          }),
          filePath: '/test/plugin.json',
        },
        // Hooks array using ${CLAUDE_PLUGIN_ROOT}
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: [
              '${CLAUDE_PLUGIN_ROOT}/config/extra-hooks.json',
              '${CLAUDE_PLUGIN_ROOT}/config/more-hooks.json',
            ],
          }),
          filePath: '/test/plugin.json',
        },
        // No hooks field
        {
          content: JSON.stringify({ name: 'my-plugin' }),
          filePath: '/test/plugin.json',
        },
        // Non-plugin.json file
        {
          content: JSON.stringify({ hooks: './scripts/setup.sh' }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Hooks path without ${CLAUDE_PLUGIN_ROOT}
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: './hooks/hooks.json',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: '${CLAUDE_PLUGIN_ROOT}',
            },
          ],
        },
        // Hooks array with paths missing ${CLAUDE_PLUGIN_ROOT}
        {
          content: JSON.stringify({
            name: 'my-plugin',
            hooks: [
              './config/extra-hooks.json',
              './config/more-hooks.json',
            ],
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: '${CLAUDE_PLUGIN_ROOT}',
            },
            {
              message: '${CLAUDE_PLUGIN_ROOT}',
            },
          ],
        },
      ],
    });
  });
});
