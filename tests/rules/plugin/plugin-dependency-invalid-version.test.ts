/**
 * Tests for plugin-dependency-invalid-version rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-dependency-invalid-version';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-dependency-invalid-version', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-dependency-invalid-version', rule, {
      valid: [
        // Valid exact version
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // Valid caret range
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '^1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // Valid tilde range
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '~1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // Valid >= range
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '>=1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // Valid range with upper bound
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '>=1.0.0 <2.0.0',
            },
          }),
          filePath: '/test/plugin.json',
        },

        // No dependencies
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
            dependencies: { test: 'invalid' },
          }),
          filePath: '/test/config.json',
        },
      ],

      invalid: [
        // Invalid: arbitrary string
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': 'latest',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semver range',
            },
          ],
        },

        // Invalid: incomplete version
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '1.0',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semver range',
            },
          ],
        },

        // Invalid: asterisk wildcard
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'other-plugin': '*',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semver range',
            },
          ],
        },

        // Multiple invalid versions
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            dependencies: {
              'plugin-a': 'latest',
              'plugin-b': 'v1.0.0',
            },
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semver range',
            },
            {
              message: 'Invalid semver range',
            },
          ],
        },
      ],
    });
  });
});
