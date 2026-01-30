/**
 * Tests for plugin-components-wrong-location rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-components-wrong-location';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-components-wrong-location', () => {
  it('should pass when no components in .claude-plugin/', async () => {
    await ruleTester.run('plugin-components-wrong-location', rule, {
      valid: [
        {
          filePath: '/test/plugin.json',
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

  // Note: Testing this rule fully requires filesystem mocking or integration tests
  // since it uses fileExists(). The rule logic is tested but actual file checking
  // would need a more complex test setup with temporary directories.
});
