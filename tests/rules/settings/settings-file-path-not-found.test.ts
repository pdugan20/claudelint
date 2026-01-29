/**
 * Tests for settings-file-path-not-found rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/settings/settings-file-path-not-found';

const ruleTester = new ClaudeLintRuleTester();

describe('settings-file-path-not-found', () => {
  it('should pass when no file paths specified', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            permissions: [],
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip paths with variable expansion', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            apiKeyHelper: '${HOME}/.config/api-key.sh',
            outputStyle: '$HOME/.config/output.md',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip non-settings.json files', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/random.json',
          content: JSON.stringify({
            apiKeyHelper: '/does/not/exist.sh',
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should handle invalid JSON gracefully', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: 'invalid json{',
        },
      ],
      invalid: [],
    });
  });

  it('should skip when apiKeyHelper is not a string', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            apiKeyHelper: 123,
          }),
        },
      ],
      invalid: [],
    });
  });

  it('should skip when outputStyle is not a string', async () => {
    await ruleTester.run('settings-file-path-not-found', rule, {
      valid: [
        {
          filePath: '/test/.claude/settings.json',
          content: JSON.stringify({
            outputStyle: true,
          }),
        },
      ],
      invalid: [],
    });
  });

  // Note: Testing actual file existence requires integration tests with real filesystem
  // or complex mocking. The rule logic is tested here, filesystem interaction tested separately.
});
