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
            permissions: [
              {
                tool: 'Bash(*.sh)',
                prompt: 'run shell scripts',
              },
              {
                tool: 'Read(src/**)',
                prompt: 'read source files',
              },
            ],
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
            permissions: [
              {
                tool: 'Bash',
                prompt: 'run bash commands',
              },
            ],
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
            permissions: [
              {
                tool: 'Bash()',
                prompt: 'run bash commands',
              },
            ],
          }),
          errors: [{ message: 'Empty inline pattern in Tool(pattern) syntax: Bash()' }],
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
            permissions: [
              {
                tool: 'Read(   )',
                prompt: 'read files',
              },
            ],
          }),
          errors: [{ message: 'Empty inline pattern in Tool(pattern) syntax: Read(   )' }],
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
            permissions: [
              {
                tool: 'Bash()',
                prompt: 'run bash commands',
              },
              {
                tool: 'Read()',
                prompt: 'read files',
              },
            ],
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
            permissions: [
              {
                tool: 'Write()',
                prompt: 'write files',
              },
            ],
          }),
          options: { allowEmpty: false },
          errors: [{ message: 'Empty inline pattern in Tool(pattern) syntax: Write()' }],
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
            permissions: [
              {
                tool: 'Bash()',
                prompt: 'run bash',
              },
            ],
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

  it('should pass when no permissions array', async () => {
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
