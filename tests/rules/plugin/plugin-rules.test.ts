/**
 * Tests for Plugin rules
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule as pluginNameRequired } from '../../../src/rules/plugin/plugin-name-required';
import { rule as pluginVersionRequired } from '../../../src/rules/plugin/plugin-version-required';
import { rule as pluginDescriptionRequired } from '../../../src/rules/plugin/plugin-description-required';
import { rule as pluginJsonWrongLocation } from '../../../src/rules/plugin/plugin-json-wrong-location';
import { rule as pluginComponentsWrongLocation } from '../../../src/rules/plugin/plugin-components-wrong-location';

const ruleTester = new ClaudeLintRuleTester();

describe('plugin-name-required', () => {
  it('should pass for valid plugin with name', async () => {
    await ruleTester.run('plugin-name-required', pluginNameRequired, {
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
    await ruleTester.run('plugin-name-required', pluginNameRequired, {
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
    await ruleTester.run('plugin-name-required', pluginNameRequired, {
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
    await ruleTester.run('plugin-name-required', pluginNameRequired, {
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
    await ruleTester.run('plugin-name-required', pluginNameRequired, {
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

describe('plugin-version-required', () => {
  it('should pass for valid plugin with version', async () => {
    await ruleTester.run('plugin-version-required', pluginVersionRequired, {
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
    await ruleTester.run('plugin-version-required', pluginVersionRequired, {
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
    await ruleTester.run('plugin-version-required', pluginVersionRequired, {
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
    await ruleTester.run('plugin-version-required', pluginVersionRequired, {
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

describe('plugin-description-required', () => {
  it('should pass for valid plugin with description', async () => {
    await ruleTester.run('plugin-description-required', pluginDescriptionRequired, {
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
    await ruleTester.run('plugin-description-required', pluginDescriptionRequired, {
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
    await ruleTester.run('plugin-description-required', pluginDescriptionRequired, {
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
    await ruleTester.run('plugin-description-required', pluginDescriptionRequired, {
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

describe('plugin-json-wrong-location', () => {
  it('should pass when plugin.json is at repository root', async () => {
    await ruleTester.run('plugin-json-wrong-location', pluginJsonWrongLocation, {
      valid: [
        {
          filePath: '/test/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
        },
        {
          filePath: '/test/my-project/plugin.json',
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

  it('should fail when plugin.json is inside .claude-plugin/', async () => {
    await ruleTester.run('plugin-json-wrong-location', pluginJsonWrongLocation, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude-plugin/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json should be at the repository root, not inside .claude-plugin/',
            },
          ],
        },
        {
          filePath: '/test/project/.claude-plugin/nested/plugin.json',
          content: JSON.stringify({
            name: 'my-plugin',
            version: '1.0.0',
            description: 'A test plugin',
          }),
          errors: [
            {
              message:
                'plugin.json should be at the repository root, not inside .claude-plugin/',
            },
          ],
        },
      ],
    });
  });
});

describe('plugin-components-wrong-location', () => {
  it('should pass when no components in .claude-plugin/', async () => {
    await ruleTester.run('plugin-components-wrong-location', pluginComponentsWrongLocation, {
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

  // Note: Testing this rule fully requires filesystem mocking or integration tests
  // since it uses fileExists(). The rule logic is tested but actual file checking
  // would need a more complex test setup with temporary directories.
});
