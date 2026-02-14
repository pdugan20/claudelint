/**
 * Tests for settings-invalid-env-var rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/settings/settings-invalid-env-var';

const ruleTester = new ClaudeLintRuleTester();

describe('settings-invalid-env-var', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('settings-invalid-env-var', rule, {
      valid: [
        // Valid uppercase env var
        {
          content: JSON.stringify({
            env: {
              DATABASE_URL: 'postgresql://localhost',
            },
          }),
          filePath: '/test/settings.json',
        },

        // Valid with underscores
        {
          content: JSON.stringify({
            env: {
              API_KEY: '${API_KEY}',
              DATABASE_HOST: 'localhost',
            },
          }),
          filePath: '/test/settings.json',
        },

        // Secret with variable expansion
        {
          content: JSON.stringify({
            env: {
              SECRET_TOKEN: '${SECRET_TOKEN}',
            },
          }),
          filePath: '/test/settings.json',
        },

        // Not a settings.json file
        {
          content: JSON.stringify({ env: { test: 'value' } }),
          filePath: '/test/config.json',
        },

        // No env field
        {
          content: JSON.stringify({ permissions: [] }),
          filePath: '/test/settings.json',
        },
      ],

      invalid: [
        // Lowercase env var name
        {
          content: JSON.stringify({
            env: {
              database_url: 'postgresql://localhost',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Non-standard env var name',
            },
          ],
        },

        // camelCase env var name
        {
          content: JSON.stringify({
            env: {
              databaseUrl: 'postgresql://localhost',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Non-standard env var name',
            },
          ],
        },

        // Empty value
        {
          content: JSON.stringify({
            env: {
              DATABASE_URL: '',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Empty value',
            },
          ],
        },

        // Whitespace only value
        {
          content: JSON.stringify({
            env: {
              API_KEY: '   ',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Empty value',
            },
          ],
        },

        // Hardcoded secret (long value)
        {
          content: JSON.stringify({
            env: {
              API_SECRET: 'sk-1234567890abcdefghijklmnop',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Possible hardcoded secret',
            },
          ],
        },

        // Hardcoded token
        {
          content: JSON.stringify({
            env: {
              AUTH_TOKEN: 'token_1234567890abcdefg',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Possible hardcoded secret',
            },
          ],
        },

        // Hardcoded password
        {
          content: JSON.stringify({
            env: {
              DB_PASSWORD: 'supersecretpassword123',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Possible hardcoded secret',
            },
          ],
        },

        // Multiple errors (includes hardcoded secret check)
        {
          content: JSON.stringify({
            env: {
              apiKey: 'hardcoded_key_12345',
              DATABASE_URL: '',
            },
          }),
          filePath: '/test/settings.json',
          errors: [
            {
              message: 'Non-standard env var name',
            },
            {
              message: 'Possible hardcoded secret',
            },
            {
              message: 'Empty value',
            },
          ],
        },
      ],
    });
  });
});
