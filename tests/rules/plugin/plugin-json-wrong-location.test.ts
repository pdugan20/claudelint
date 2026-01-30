/**
 * Tests for plugin-json-wrong-location rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-json-wrong-location';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-json-wrong-location', () => {
  it('should pass when plugin.json is at repository root', async () => {
    await ruleTester.run('plugin-json-wrong-location', rule, {
      valid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
        },
        {
          filePath: '/test/my-project/plugin.json',
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

  it('should fail when plugin.json is inside .claude-plugin/', async () => {
    await ruleTester.run('plugin-json-wrong-location', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude-plugin/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json should be at the repository root, not inside .claude-plugin/',
            },
          ],
        },
        {
          filePath: '/test/project/.claude-plugin/nested/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json should be at the repository root, not inside .claude-plugin/',
            },
          ],
        },
      ],
    });
  });
});
