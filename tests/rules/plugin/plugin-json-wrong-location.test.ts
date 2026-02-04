/**
 * Tests for plugin-json-wrong-location rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-json-wrong-location';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-json-wrong-location', () => {
  it('should pass when plugin.json is in .claude-plugin/ directory', async () => {
    await ruleTester.run('plugin-json-wrong-location', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
        },
        {
          filePath: '/test/my-project/.claude-plugin/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should fail when plugin.json is at repository root (not in .claude-plugin/)', async () => {
    await ruleTester.run('plugin-json-wrong-location', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json must be at .claude-plugin/plugin.json, not at repository root',
            },
          ],
        },
        {
          filePath: '/test/project/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json must be at .claude-plugin/plugin.json, not at repository root',
            },
          ],
        },
      ],
    });
  });
});
