/**
 * Tests for lsp-language-id-empty rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-language-id-empty';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-language-id-empty', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-language-id-empty', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': 'typescript',
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': '',
            },
          }),
          errors: [{ message: 'Language ID for extension ".ts" cannot be empty' }],
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {},
            extensionMapping: {
              '.ts': '   ',
            },
          }),
          errors: [{ message: 'Language ID for extension ".ts" cannot be empty' }],
        },
      ],
    });
  });
});
