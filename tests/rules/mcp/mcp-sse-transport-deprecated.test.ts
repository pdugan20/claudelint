/**
 * Tests for mcp-sse-transport-deprecated rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-sse-transport-deprecated';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-sse-transport-deprecated', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-sse-transport-deprecated', rule, {
      valid: [
        // HTTP transport (not deprecated)
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
        // WebSocket transport (not deprecated)
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
        // stdio transport (not deprecated)
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
        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // SSE transport (deprecated)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
                  url: 'http://localhost:3000/sse',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'SSE transport is deprecated',
            },
          ],
        },
        // Multiple SSE transports
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
                  url: 'http://localhost:3000/sse',
                },
              server2: {
                  type: 'sse',
                  url: 'http://localhost:4000/events',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'SSE transport is deprecated',
            },
            {
              message: 'SSE transport is deprecated',
            },
          ],
        },
        // Mixed transports (only SSE triggers warning)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
                  url: 'http://localhost:8080',
                },
              server2: {
                  type: 'sse',
                  url: 'http://localhost:3000',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'SSE transport is deprecated',
            },
          ],
        },
      ],
    });
  });
});
