/**
 * Tests for plugin-description-required rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-description-required';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-description-required', () => {
  it('should pass for valid plugin with description', async () => {
    await ruleTester.run('plugin-description-required', rule, {
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

  it('should fail when description is missing', async () => {
    await ruleTester.run('plugin-description-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
          }),
          errors: [{ message: 'Plugin description is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when description is empty string', async () => {
    await ruleTester.run('plugin-description-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: '',
          }),
          errors: [{ message: 'Plugin description is required and cannot be empty' }],
        },
      ],
    });
  });

  it('should fail when description is whitespace only', async () => {
    await ruleTester.run('plugin-description-required', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: '   ',
          }),
          errors: [{ message: 'Plugin description is required and cannot be empty' }],
        },
      ],
    });
  });
});
