/**
 * Tests for mcp-websocket-invalid-protocol rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-websocket-invalid-protocol';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-websocket-invalid-protocol', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-websocket-invalid-protocol', rule, {
      valid: [
        // Valid ws:// protocol
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
        // Valid wss:// protocol
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'wss://api.example.com/ws',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // URL with variable expansion ${VAR} (skipped)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: '${WS_URL}',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // URL with simple variable $VAR (skipped)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: '$WS_URL',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Non-WebSocket transport (should be ignored)
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
        // Not an MCP file (should be ignored)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'http://localhost:9000',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // HTTP protocol instead of ws://
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'http://localhost:9000',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'WebSocket URL should use ws:// or wss:// protocol, found http:',
            },
          ],
        },
        // HTTPS protocol instead of wss://
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'https://api.example.com/ws',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'WebSocket URL should use ws:// or wss:// protocol, found https:',
            },
          ],
        },
        // FTP protocol
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'ftp://server.com',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'WebSocket URL should use ws:// or wss:// protocol, found ftp:',
            },
          ],
        },
        // Multiple invalid protocols
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: 'http://localhost:9000',
                },
              server2: {
                  type: 'websocket',
                  url: 'https://api.example.com',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'found http:',
            },
            {
              message: 'found https:',
            },
          ],
        },
      ],
    });
  });
});
