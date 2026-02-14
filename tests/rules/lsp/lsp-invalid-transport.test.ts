/**
 * Tests for lsp-invalid-transport rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-invalid-transport';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-invalid-transport', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-invalid-transport', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
              transport: 'stdio',
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
              transport: 'socket',
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
            },
          }),
        },
      ],
      invalid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            'ts-server': {
              command: 'test',
              extensionToLanguage: { '.ts': 'typescript' },
              transport: 'http',
            },
          }),
          errors: [{ message: 'Invalid transport "http"' }],
        },
      ],
    });
  });
});
