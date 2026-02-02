/**
 * Tests for mcp-websocket-empty-url rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-websocket-empty-url';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-websocket-empty-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-websocket-empty-url', rule, {
      valid: [
        // Valid WebSocket URL
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
        // Valid secure WebSocket URL
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
        // Non-WebSocket transport (should be ignored)
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
                  type: 'websocket',
                  url: '',
                },
            },
          }),
          filePath: 'package.json',
        },
      ],
      invalid: [
        // Empty URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: '',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'MCP WebSocket transport URL cannot be empty',
            },
          ],
        },
        // Whitespace-only URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: '   ',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'URL cannot be empty',
            },
          ],
        },
        // Missing URL field
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'URL cannot be empty',
            },
          ],
        },
        // Multiple servers with empty URLs
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'websocket',
                  url: '',
                },
              server2: {
                  type: 'websocket',
                  url: '  ',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'URL cannot be empty',
            },
            {
              message: 'URL cannot be empty',
            },
          ],
        },
      ],
    });
  });
});
