/**
 * Tests for lsp-language-id-not-lowercase rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-language-id-not-lowercase';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-language-id-not-lowercase', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-language-id-not-lowercase', rule, {
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
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            typescript: {
              command: 'typescript-language-server',
              extensionToLanguage: {
                '.ts': 'TypeScript',
              },
            },
          }),
          errors: [{ message: 'Language ID "TypeScript" is not lowercase' }],
        },
      ],
    });
  });
});
