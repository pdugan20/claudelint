/**
 * Tests for plugin-invalid-version rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-invalid-version';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-invalid-version', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('plugin-invalid-version', rule, {
      valid: [
        // Valid semver
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          filePath: '/test/plugin.json',
        },

        // Valid semver with patch
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '2.5.3',
          }),
          filePath: '/test/plugin.json',
        },

        // Valid semver with prerelease
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0-beta',
          }),
          filePath: '/test/plugin.json',
        },

        // Valid semver with build metadata
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0+build123',
          }),
          filePath: '/test/plugin.json',
        },

        // Valid semver with prerelease and build
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0-alpha.1+build456',
          }),
          filePath: '/test/plugin.json',
        },

        // Not a plugin.json file
        {
          content: JSON.stringify({
            version: 'invalid',
          }),
          filePath: '/test/config.json',
        },

        // No version field
        {
          content: JSON.stringify({
            name: 'my-plugin',
          }),
          filePath: '/test/plugin.json',
        },
      ],

      invalid: [
        // Invalid: missing patch version
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semantic version',
            },
          ],
        },

        // Invalid: only major version
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semantic version',
            },
          ],
        },

        // Invalid: arbitrary string
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: 'latest',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semantic version',
            },
          ],
        },

        // Invalid: v prefix
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: 'v1.0.0',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semantic version',
            },
          ],
        },

        // Invalid: leading zeros
        {
          content: JSON.stringify({
            name: 'my-plugin',
            version: '01.02.03',
          }),
          filePath: '/test/plugin.json',
          errors: [
            {
              message: 'Invalid semantic version',
            },
          ],
        },
      ],
    });
  });
});
