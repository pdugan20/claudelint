/**
 * Tests for lsp-command-bare-name rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-command-bare-name';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-command-bare-name', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-command-bare-name', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: '/usr/local/bin/typescript-language-server',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: './bin/typescript-language-server',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: '/usr/bin/test',
              extensionToLanguage: { '.ts': 'typescript' },
              configFile: './lsp-config.json',
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: 'typescript-language-server --stdio',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
          errors: [{ message: 'is a bare name, not an explicit path' }],
        },
      ],
    });
  });
});
