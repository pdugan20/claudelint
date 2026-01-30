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
            servers: {
              'ts-server': {
                command: 'test',
                transport: 'stdio',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
                transport: 'socket',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                command: 'test',
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
                command: 'test',
                transport: 'http',
              },
            },
          }),
          errors: [{ message: 'Invalid transport type "http"' }],
        },
      ],
    });
  });
});
