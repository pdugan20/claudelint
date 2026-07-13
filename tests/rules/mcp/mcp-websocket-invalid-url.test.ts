/**
 * Tests for mcp-websocket-invalid-url rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-websocket-invalid-url';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-websocket-invalid-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-websocket-invalid-url', rule, {
      valid: [
        // Valid WebSocket URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: 'ws://localhost:9000',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Valid secure WebSocket URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
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
                  type: 'ws',
                  url: '${WS_URL}/socket',
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
                  type: 'ws',
                  url: '$BASE_URL/ws',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Empty URL (handled by mcp-websocket-empty-url, not this rule)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: '',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Whitespace-only URL (handled by mcp-websocket-empty-url, not this rule)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: '   ',
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
                  url: 'not a valid url',
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
                  type: 'ws',
                  url: 'invalid',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // Invalid URL format
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: 'not-a-valid-url',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in WebSocket transport',
            },
          ],
        },
        // Malformed URL (spaces not allowed)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: 'ws://local host:9000',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in WebSocket transport',
            },
          ],
        },
        // Multiple invalid URLs
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'ws',
                  url: 'invalid-url-1',
                },
              server2: {
                  type: 'ws',
                  url: 'invalid-url-2',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in WebSocket transport',
            },
            {
              message: 'Invalid URL in WebSocket transport',
            },
          ],
        },
      ],
    });
  });
});
