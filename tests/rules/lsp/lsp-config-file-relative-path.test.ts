/**
 * Tests for lsp-config-file-relative-path rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/lsp/lsp-config-file-relative-path';

const ruleTester = new ClaudeLintRuleTester();

describe('lsp-config-file-relative-path', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('lsp-config-file-relative-path', rule, {
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
                configFile: 'config.json',
              },
            },
          }),
          errors: [{ message: 'uses relative path' }],
        },
      ],
    });
  });
});
