/**
 * Tests for lsp-extension-missing-dot rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-extension-missing-dot';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-extension-missing-dot', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-extension-missing-dot', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            typescript: {
              command: 'typescript-language-server',
              extensionToLanguage: {
                '.ts': 'typescript',
                '.js': 'javascript',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            typescript: {
              command: 'typescript-language-server',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            typescript: {
              command: 'typescript-language-server',
              extensionToLanguage: {
                ts: 'typescript',
              },
            },
          }),
          errors: [{ message: 'Extension "ts"' }],
        },
      ],
    });
  });
});
