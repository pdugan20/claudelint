/**
 * Tests for lsp-command-not-in-path rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-command-not-in-path';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-command-not-in-path', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-command-not-in-path', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: '/usr/local/bin/typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: './bin/typescript-language-server',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './lsp-config.json',
              },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'typescript-language-server --stdio',
              },
            },
          }),
          errors: [{ message: 'should be in PATH or use absolute path' }],
        },
      ],
    });
  });
});
