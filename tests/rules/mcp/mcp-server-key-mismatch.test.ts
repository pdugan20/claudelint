/**
 * Tests for mcp-server-key-mismatch rule (DEPRECATED)
 * This rule is deprecated because server names are now object keys only,
 * there is no separate name property to mismatch with.
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-server-key-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-server-key-mismatch', () => {
  it('should pass validation tests (deprecated rule always passes)', async () => {
    await ruleTester.run('mcp-server-key-mismatch', rule, {
      valid: [
        // All configurations are valid since the rule is deprecated
        {
          content: JSON.stringify({
            mcpServers: {
              'my-server': {
                type: 'stdio',
                command: 'node',
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Multiple servers
        {
          content: JSON.stringify({
            mcpServers: {
              database: {
                type: 'stdio',
                command: 'node',
              },
              api: {
                type: 'http',
                url: 'http://localhost:8080',
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              serverKey: {},
            },
          }),
          filePath: 'package.json',
        },
      ],

      invalid: [
        // No invalid cases - rule is deprecated and never reports errors
      ],
    });
  });
});
