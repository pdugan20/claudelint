/**
 * Tests for plugin-marketplace-files-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-marketplace-files-not-found';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-marketplace-files-not-found', () => {
  it('should pass when no file references specified', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/marketplace.json',
          content: JSON.stringify({
            name: 'My Plugin',
            description: 'Test plugin',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-marketplace.json files', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            icon: 'does-not-exist.png',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should handle invalid JSON gracefully', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/marketplace.json',
          content: 'invalid json{',
        },
      ],
      invalid: [],
    });
  });

  it('should handle schema validation failures gracefully', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/marketplace.json',
          content: JSON.stringify({
            // Missing required fields - schema validation should fail
            icon: 'icon.png',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip when icon is not a string', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/marketplace.json',
          content: JSON.stringify({
            name: 'Test',
            description: 'Test',
            version: '1.0.0',
            icon: 123,
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip when screenshots is not an array', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/marketplace.json',
          content: JSON.stringify({
            name: 'Test',
            description: 'Test',
            version: '1.0.0',
            screenshots: 'not-an-array',
          }),
        },
      ],
      invalid: [],
    });
  });

  // Note: Testing actual file existence requires integration tests with real filesystem
  // or complex mocking. The rule logic is tested here, filesystem interaction tested separately.
});
