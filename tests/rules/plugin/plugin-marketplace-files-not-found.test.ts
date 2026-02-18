/**
 * Tests for plugin-marketplace-files-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-marketplace-files-not-found';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-marketplace-files-not-found', () => {
  it('should skip non-marketplace.json files', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            source: './plugins/missing',
          }),
        },
        {
          filePath: '/test/config.json',
          content: JSON.stringify({ plugins: [] }),
        },
      ],
      invalid: [],
    });
  });

  it('should handle invalid JSON gracefully', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/marketplace.json',
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
          filePath: '/test/.claude-plugin/marketplace.json',
          content: JSON.stringify({
            // Missing required fields — schema validation fails, rule skips
            description: 'No name or owner',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip external source objects (github)', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/marketplace.json',
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'external-plugin',
                source: { source: 'github', repo: 'owner/repo' },
              },
            ],
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip external source objects (url)', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/marketplace.json',
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'url-plugin',
                source: {
                  source: 'url',
                  url: 'https://gitlab.com/team/plugin.git',
                },
              },
            ],
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip external source objects (npm)', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/marketplace.json',
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'npm-plugin',
                source: { source: 'npm', package: '@scope/plugin' },
              },
            ],
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should pass with empty plugins array', async () => {
    await ruleTester.run('plugin-marketplace-files-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude-plugin/marketplace.json',
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [],
          }),
        },
      ],
      invalid: [],
    });
  });

  // Note: Testing actual filesystem checks (directory existence, plugin.json presence)
  // requires integration tests with temporary directories. The rule logic for skip paths
  // (non-marketplace files, invalid JSON, schema failures, external sources) is tested above.
  // Filesystem interaction is tested in integration tests.
});
