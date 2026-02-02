/**
 * Tests for mcp-http-empty-url rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-http-empty-url';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-http-empty-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-http-empty-url', rule, {
      valid: [
        // Valid HTTP URL
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
        // Valid HTTPS URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
                  url: 'https://api.example.com',
                },
            },
          }),
          filePath: 'test.mcp.json',
        },
        // Non-HTTP transport (should be ignored)
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
                  type: 'http',
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
                  type: 'http',
                  url: '',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'MCP HTTP transport URL cannot be empty',
            },
          ],
        },
        // Whitespace-only URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
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
                  type: 'http',
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
                  type: 'http',
                  url: '',
                },
              server2: {
                  type: 'http',
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
