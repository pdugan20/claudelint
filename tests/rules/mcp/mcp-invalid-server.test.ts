/**
 * Tests for mcp-invalid-server rule (DEPRECATED)
 * This rule is deprecated because server names are now object keys,
 * which are inherently unique in JSON.
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-invalid-server';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-invalid-server', () => {
  it('should pass validation tests (deprecated rule always passes)', async () => {
    await ruleTester.run('mcp-invalid-server', rule, {
      valid: [
        // All configurations are valid since the rule is deprecated
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                type: 'stdio',
                command: 'node',
              },
              server2: {
                type: 'stdio',
                command: 'node',
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Empty mcpServers
        {
          content: JSON.stringify({
            mcpServers: {},
          }),
          filePath: 'test.mcp.json',
        },

        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {},
              server2: {},
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
