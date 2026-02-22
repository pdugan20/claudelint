/**
 * Rule: mcp-http-invalid-url
 *
 * Validates that HTTP transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { mcpServerUrls, validateMcpUrl } from '../../utils/validators/mcp-url';

export const rule: Rule = {
  meta: {
    id: 'mcp-http-invalid-url',
    name: 'MCP HTTP Invalid URL',
    description: 'MCP HTTP transport URL must be valid',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/mcp/mcp-http-invalid-url',
    docs: {
      recommended: true,
      summary: 'Validates that MCP HTTP transport URLs are well-formed.',
      rationale: 'An invalid URL prevents Claude Code from connecting to the HTTP MCP server.',
      details:
        'This rule checks that the url field of MCP servers with type "http" is a valid URL by ' +
        'attempting to parse it with the URL constructor. URLs containing variable expansions (${ or $) ' +
        'are skipped since they are resolved at runtime. An invalid URL will prevent Claude Code from ' +
        'connecting to the remote MCP server, causing silent failures or error messages at runtime.',
      examples: {
        incorrect: [
          {
            description: 'HTTP server with a malformed URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http",\n      "url": "not-a-valid-url"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'HTTP server with a valid URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http",\n      "url": "https://mcp.example.com/sse"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Provide a fully qualified URL including the scheme (http:// or https://). Ensure the URL ' +
        'is well-formed and reachable from the environment where Claude Code runs.',
      relatedRules: ['mcp-http-empty-url', 'mcp-sse-invalid-url', 'mcp-websocket-invalid-url'],
    },
  },

  validate: (context) => {
    for (const { url } of mcpServerUrls(context, 'http')) {
      validateMcpUrl(url, 'HTTP', context);
    }
  },
};
