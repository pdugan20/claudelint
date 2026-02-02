/**
 * Tests for mcp-http-invalid-url rule
 */
import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-http-invalid-url';
const ruleTester = new ClaudeLintRuleTester();
describe('mcp-http-invalid-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-http-invalid-url', rule, {
      valid: [
        // Valid HTTP URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
                  url: 'http://localhost:8080/api',
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
                  url: 'https://api.example.com/v1',
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
                  type: 'http',
                  url: '${API_URL}/endpoint',
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
                  type: 'http',
                  url: '$BASE_URL/api',
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
                  type: 'websocket',
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
                  type: 'http',
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
                  type: 'http',
                  url: 'not-a-valid-url',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in HTTP transport',
            },
          ],
        },
        // Malformed URL (spaces not allowed)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
                  url: 'http://local host:8080',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in HTTP transport',
            },
          ],
        },
        // Multiple invalid URLs
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                  type: 'http',
                  url: 'invalid-url-1',
                },
              server2: {
                  type: 'http',
                  url: 'invalid-url-2',
                },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in HTTP transport',
            },
            {
              message: 'Invalid URL in HTTP transport',
            },
          ],
        },
      ],
    });
  });
});
