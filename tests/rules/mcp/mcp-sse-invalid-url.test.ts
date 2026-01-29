/**
 * Tests for mcp-sse-invalid-url rule
 */

import { ClaudeLintRuleTester } from '../../helpers/rule-tester';
import { rule } from '../../../src/rules/mcp/mcp-sse-invalid-url';

const ruleTester = new ClaudeLintRuleTester();

describe('mcp-sse-invalid-url', () => {
  it('should pass validation tests', async () => {
    await ruleTester.run('mcp-sse-invalid-url', rule, {
      valid: [
        // Valid HTTP URL
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'sse',
                  url: 'http://localhost:3000/sse',
                },
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
                transport: {
                  type: 'sse',
                  url: 'https://api.example.com/events',
                },
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
                transport: {
                  type: 'sse',
                  url: '${API_URL}/sse',
                },
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
                transport: {
                  type: 'sse',
                  url: '$BASE_URL/events',
                },
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
                transport: {
                  type: 'http',
                  url: 'not a valid url',
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
                  type: 'sse',
                  url: 'invalid',
                },
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
                transport: {
                  type: 'sse',
                  url: 'not-a-valid-url',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in SSE transport',
            },
          ],
        },

        // Malformed URL (spaces not allowed)
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'sse',
                  url: 'http://local host:3000',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in SSE transport',
            },
          ],
        },

        // Multiple invalid URLs
        {
          content: JSON.stringify({
            mcpServers: {
              server1: {
                transport: {
                  type: 'sse',
                  url: 'invalid-url-1',
                },
              },
              server2: {
                transport: {
                  type: 'sse',
                  url: 'invalid-url-2',
                },
              },
            },
          }),
          filePath: 'test.mcp.json',
          errors: [
            {
              message: 'Invalid URL in SSE transport',
            },
            {
              message: 'Invalid URL in SSE transport',
            },
          ],
        },
      ],
    });
  });
});
