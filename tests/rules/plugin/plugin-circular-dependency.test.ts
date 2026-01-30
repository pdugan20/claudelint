/**
 * Tests for plugin-circular-dependency rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-circular-dependency';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-circular-dependency', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-circular-dependency', rule, {
      valid: [
        // No dependencies
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          filePath: '/test/plugin.json',
        },

        // Dependencies on other plugins
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '1.0.0',
              'another-plugin': '^2.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // No name field (handled by schema validation)
        {
          content: JSON.stringify({
            version: '1.0.0',
            dependencies: {
              'my-plugin': '1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // Not a plugin.json file
        {
          content: JSON.stringify({
            name: 'test',
            dependencies: { test: '1.0.0' },
          }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Direct self-dependency
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'my-plugin': '1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Circular dependency detected',
            },
          ],
        },

        // Self-dependency with other dependencies
        {
          content: JSON.stringify({
            name: 'test-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '^1.0.0',
              'test-plugin': '1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Circular dependency detected',
            },
          ],
        },
      ],
    });
  });
});
