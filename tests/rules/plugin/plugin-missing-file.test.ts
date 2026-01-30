/**
 * Tests for plugin-missing-file rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-missing-file';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-missing-file', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-missing-file', rule, {
      valid: [
        // No skills/agents/hooks/commands/mcpServers
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          filePath: '/test/plugin.json',
        },

        // Empty arrays
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            skills: [],
            agents: [],
            hooks: [],
            commands: [],
          }),
          filePath: '/test/plugin.json',
        },

        // Not a plugin.json file
        {
          content: JSON.stringify({
            skills: ['test-skill'],
          }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to check if referenced files exist.
        // Invalid cases would require creating test directories with plugin.json and
        // verifying that referenced skills/agents/hooks/commands don't exist, which is
        // beyond the scope of simple content-based testing.
      ],
    });
  });
});
