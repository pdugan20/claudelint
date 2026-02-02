/**
 * Tests for settings-permission-empty-pattern rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/settings/settings-permission-empty-pattern';

const ruleTester = new ClaudeLintRuleTester();

describe('settings-permission-empty-pattern', () => {
  it('should pass when patterns are not empty', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash(*.sh)', 'Read(src/**)'],
            },
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should pass when tool has no inline pattern', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash', 'Read', 'Write'],
            },
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should warn when inline pattern is empty (default behavior)', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash()'],
            },
          }),
          errors: [{ message: 'Empty inline pattern' }],
        },
      ],
    });
  });

  it('should warn when inline pattern contains only whitespace', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              deny: ['Read(   )'],
            },
          }),
          errors: [{ message: 'Empty inline pattern' }],
        },
      ],
    });
  });

  it('should warn for multiple empty patterns', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash()'],
              deny: ['Read()'],
              ask: ['Write()'],
            },
          }),
          errors: [
            { message: 'Empty inline pattern' },
            { message: 'Empty inline pattern' },
            { message: 'Empty inline pattern' },
          ],
        },
      ],
    });
  });

  it('should pass when allowEmpty is true', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash()', 'Read()'],
            },
          }),
          options: { allowEmpty: true },
        },
      ],
      invalid: [],
    });
  });

  it('should warn when allowEmpty is false (explicit)', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [],
      invalid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: {
              ask: ['Write()'],
            },
          }),
          options: { allowEmpty: false },
          errors: [{ message: 'Empty inline pattern' }],
        },
      ],
    });
  });

  it('should skip non-settings.json files', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/random.json',
          content: JSON.stringify({
            permissions: {
              allow: ['Bash()'],
            },
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should handle invalid JSON gracefully', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: 'invalid json{',
        },
      ],
      invalid: [],
    });
  });

  it('should pass when no permissions object', async () => {
    await ruleTester.run('settings-permission-empty-pattern', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            other: 'config',
          }),
        },
      ],
      invalid: [],
    });
  });
});
