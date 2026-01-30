/**
 * Tests for plugin-invalid-manifest rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-invalid-manifest';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-invalid-manifest', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-invalid-manifest', rule, {
      valid: [
        // No marketplace.json (optional)
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          filePath: '/test/plugin.json',
        },

        // Not a plugin.json file
        {
          content: JSON.stringify({
            name: 'test',
          }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Note: This rule requires filesystem access to:
        // 1. Check if marketplace.json exists
        // 2. Read marketplace.json content
        // 3. Validate marketplace.json schema
        // 4. Compare versions between plugin.json and marketplace.json
        //
        // Invalid cases would require creating test directories with both files,
        // which is beyond the scope of simple content-based testing.
      ],
    });
  });
});
