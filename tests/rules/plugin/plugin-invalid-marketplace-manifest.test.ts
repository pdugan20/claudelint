/**
 * Tests for plugin-invalid-marketplace-manifest rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/plugin/plugin-invalid-marketplace-manifest';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-invalid-marketplace-manifest', () => {
  it('should pass for valid marketplace.json with all required fields', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test Owner' },
            plugins: [
              {
                name: 'my-plugin',
                source: './plugins/my-plugin',
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });

  it('should pass for valid marketplace.json with optional fields', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            $schema: 'https://anthropic.com/claude-code/marketplace.schema.json',
            name: 'my-marketplace',
            description: 'A test marketplace',
            version: '1.0.0',
            owner: { name: 'Test Owner', email: 'test@example.com' },
            plugins: [],
            metadata: { pluginRoot: './plugins' },
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });

  it('should pass for plugin entries with github source', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'my-plugin',
                source: { source: 'github', repo: 'owner/repo' },
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });

  it('should pass for plugin entries with url source', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'my-plugin',
                source: {
                  source: 'url',
                  url: 'https://gitlab.com/team/plugin.git',
                },
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });

  it('should pass for plugin entries with npm source', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [
              {
                name: 'my-plugin',
                source: { source: 'npm', package: 'claude-code-lint' },
              },
            ],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-marketplace.json files', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({ name: 'test' }),
          filePath: '/test/plugin.json',
        },
        {
          content: JSON.stringify({ name: 'test' }),
          filePath: '/test/config.json',
        },
      ],
      invalid: [],
    });
  });

  it('should report invalid JSON', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: 'not valid json{',
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'Invalid JSON' }],
        },
      ],
    });
  });

  it('should report missing name field', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: JSON.stringify({
            owner: { name: 'Test' },
            plugins: [],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'name: Invalid input' }],
        },
      ],
    });
  });

  it('should report missing owner field', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            plugins: [],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'owner: Invalid input' }],
        },
      ],
    });
  });

  it('should report missing plugins array', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'plugins: Invalid input' }],
        },
      ],
    });
  });

  it('should report plugin entry missing name', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [{ source: './plugins/foo' }],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'plugins.0.name: Invalid input' }],
        },
      ],
    });
  });

  it('should report plugin entry missing source', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [],
      invalid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [{ name: 'my-plugin' }],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
          errors: [{ message: 'plugins.0.source: Invalid input' }],
        },
      ],
    });
  });

  it('should accept empty plugins array', async () => {
    await ruleTester.run('plugin-invalid-marketplace-manifest', rule, {
      valid: [
        {
          content: JSON.stringify({
            name: 'my-marketplace',
            owner: { name: 'Test' },
            plugins: [],
          }),
          filePath: '/test/.claude-plugin/marketplace.json',
        },
      ],
      invalid: [],
    });
  });
});
