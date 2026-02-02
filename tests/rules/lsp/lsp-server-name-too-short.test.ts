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
            'typescript-language-server': {
              command: 'typescript-language-server',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 5 },
          content: JSON.stringify({
            'ts-ls': {
              command: 'ts-ls',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
        {
          filePath: 'other.json',
          content: JSON.stringify({
            a: { command: 'test', extensionToLanguage: { '.ts': 'typescript' } },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            a: {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
          errors: [{ message: 'server name "a" is too short' }],
        },
        {
          filePath: '.claude/lsp.json',
          options: { minLength: 10 },
          content: JSON.stringify({
            'short': {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
          errors: [{ message: 'minimum: 10' }],
        },
      ],
    });
  });
});
