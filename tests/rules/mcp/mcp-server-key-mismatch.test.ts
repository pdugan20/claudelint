/**
 * Tests for mcp-server-key-mismatch rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-server-key-mismatch';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-server-key-mismatch', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-server-key-mismatch', rule, {
      valid: [
        // Server key matches name
        {
          content: JSON.stringify({
            mcpServers: {
              'my-server': {
                name: 'my-server',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Multiple servers with matching keys
        {
          content: JSON.stringify({
            mcpServers: {
              database: {
                name: 'database',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
              api: {
                name: 'api',
                transport: {
                  type: 'http',
                  url: 'http://localhost:8080',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Server without name property (no mismatch to check)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              serverKey: {
                name: 'differentName',
              },
            },
          }),
          filePath: 'package.json',
        },
      ],

      invalid: [
        // Server key does not match name
        {
          content: JSON.stringify({
            mcpServers: {
              serverKey: {
                name: 'actualServerName',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message:
                'Server key "serverKey" does not match server name "actualServerName"',
            },
          ],
        },

        // Multiple mismatches
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                name: 'database-server',
              },
              server2: {
                name: 'api-server',
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Server key "server1" does not match server name "database-server"',
            },
            {
              message: 'Server key "server2" does not match server name "api-server"',
            },
          ],
        },

        // Case sensitivity matters
        {
          content: JSON.stringify({
            mcpServers: {
              myserver: {
                name: 'MyServer',
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Server key "myserver" does not match server name "MyServer"',
            },
          ],
        },
      ],
    });
  });
});
