/**
 * Tests for plugin-name-required rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-name-required';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-name-required', () => {
  it('should pass for valid plugin with name', async () => {
    await ruleTester.run('plugin-name-required', rule, {
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

  it('should fail when name is missing', async () => {
    await ruleTester.run('plugin-name-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin name is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when name is empty string', async () => {
    await ruleTester.run('plugin-name-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: '',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin name is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when name is whitespace only', async () => {
    await ruleTester.run('plugin-name-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: '   ',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [{ message: 'Plugin name is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should skip non-plugin.json files', async () => {
    await ruleTester.run('plugin-name-required', rule, {
      valid: [
        {
          filePath: '/test/package.json',
          content: JSON.stringify({
            version: '1.0.0',
          }),
        },
      ],
      invalid: [],
    });
  });
});
