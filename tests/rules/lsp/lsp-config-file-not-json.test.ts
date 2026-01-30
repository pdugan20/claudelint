/**
 * Tests for lsp-config-file-not-json rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-config-file-not-json';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-config-file-not-json', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-config-file-not-json', rule, {
      valid: [
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: './config.json',
              },
            },
          }),
        },
        {
          filePath: '.claude/lsp.json',
          content: JSON.stringify({
            servers: {
              'ts-server': {
                configFile: '/absolute/path/config.json',
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
                configFile: './config.yaml',
              },
            },
          }),
          errors: [{ message: 'should be a JSON file' }],
        },
      ],
    });
  });
});
