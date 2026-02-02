/**
 * Tests for mcp-sse-empty-url rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-sse-empty-url';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-sse-empty-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-sse-empty-url', rule, {
      valid: [
        // Valid SSE URL
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
        },
        // Valid HTTPS SSE URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
                  url: 'https://api.example.com/events',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Non-SSE transport (should be ignored)
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
                  type: 'sse',
                  url: '',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'SSE transport URL cannot be empty',
            },
          ],
        },
        // Whitespace-only URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'sse',
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
                  type: 'sse',
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
      ],
    });
  });
});
