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
                  type: 'stdio',
                  command: 'node',
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
                  type: 'sse',
                  url: 'http://localhost:3000',
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
                  type: 'http',
                  url: 'http://localhost:8080',
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
                  type: 'websocket',
                  url: 'ws://localhost:9000',
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
                  type: 'invalid',
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
                  type: 'grpc',
                  command: 'node',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid transport type: grpc',
            },
          ],
        },
        // Another invalid type
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'tcp',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid transport type: tcp',
            },
          ],
        },
        // Multiple servers with invalid transports
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'invalid1',
                },
              server2: {
                  type: 'invalid2',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid transport type: invalid1',
            },
            {
              message: 'Invalid transport type: invalid2',
            },
          ],
        },
      ],
    });
  });
});
