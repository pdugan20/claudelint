/**
 * Tests for lsp-server-name-too-short rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-server-name-too-short';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-server-name-too-short', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-server-name-too-short', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'typescript-language-server': {
                command: 'typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 5 },
          content: JSON.stringify({
            servers: {
              'ts-ls': {
                command: 'ts-ls',
              },
            },
          }),
        },
        {
          filePath: 'other.json',
          content: JSON.stringify({
            servers: { a: { command: 'test' } },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              a: {
                command: 'test',
              },
            },
          }),
          errors: [{ message: 'server name "a" is too short' }],
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 10 },
          content: JSON.stringify({
            servers: {
              'short': {
                command: 'test',
              },
            },
          }),
          errors: [{ message: 'minimum: 10' }],
        },
      ],
    });
  });
});
