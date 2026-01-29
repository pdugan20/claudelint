/**
 * Tests for mcp-invalid-transport rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-invalid-transport';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-invalid-transport', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-invalid-transport', rule, {
      valid: [
        // Valid stdio transport
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

        // Valid sse transport
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'sse',
                  url: 'http://localhost:3000',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Valid http transport
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'http',
                  url: 'http://localhost:8080',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
        },

        // Valid websocket transport
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'websocket',
                  url: 'ws://localhost:9000',
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
              server1: {
                transport: {
                  type: 'invalid',
                },
              },
            },
          }),
          filePath: 'package.json',
        },
      ],

      invalid: [
        // Invalid transport type
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'grpc',
                  command: 'node',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid MCP transport type: grpc',
            },
          ],
        },

        // Another invalid type
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'tcp',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid MCP transport type: tcp',
            },
          ],
        },

        // Multiple servers with invalid transports
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'invalid1',
                },
              },
              server2: {
                transport: {
                  type: 'invalid2',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid MCP transport type: invalid1',
            },
            {
              message: 'Invalid MCP transport type: invalid2',
            },
          ],
        },
      ],
    });
  });
});
