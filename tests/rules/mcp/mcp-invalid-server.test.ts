/**
 * Tests for mcp-invalid-server rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-invalid-server';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-invalid-server', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-invalid-server', rule, {
      valid: [
        // Servers with unique names
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                name: 'Database Server',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
              server2: {
                name: 'API Server',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Servers without name property (key is used)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
              server2: {
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
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
              server1: {
                name: 'Duplicate',
              },
              server2: {
                name: 'Duplicate',
              },
            },
          }),
          filePath: 'package.json',
        },
      ],

      invalid: [
        // Duplicate server names
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                name: 'My Server',
                transport: {
                  type: 'stdio',
                  command: 'node',
                },
              },
              server2: {
                name: 'My Server',
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
              message: 'Duplicate MCP server name: My Server',
            },
          ],
        },

        // Multiple duplicates
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                name: 'Database',
              },
              server2: {
                name: 'Database',
              },
              server3: {
                name: 'API',
              },
              server4: {
                name: 'API',
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Duplicate MCP server name: Database',
            },
            {
              message: 'Duplicate MCP server name: API',
            },
          ],
        },

        // Three servers with same name
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                name: 'Shared',
              },
              server2: {
                name: 'Shared',
              },
              server3: {
                name: 'Shared',
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Duplicate MCP server name: Shared',
            },
            {
              message: 'Duplicate MCP server name: Shared',
            },
          ],
        },
      ],
    });
  });
});
