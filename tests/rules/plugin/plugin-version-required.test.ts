/**
 * Tests for plugin-version-required rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-version-required';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-version-required', () => {
  it('should pass for valid plugin with version', async () => {
    await ruleTester.run('plugin-version-required', rule, {
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

  it('should fail when version is missing', async () => {
    await ruleTester.run('plugin-version-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin version is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when version is empty string', async () => {
    await ruleTester.run('plugin-version-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin version is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when version is whitespace only', async () => {
    await ruleTester.run('plugin-version-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '  ',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin version is required and cannot be empty' }],
        },
      ],
    });
  });
});
