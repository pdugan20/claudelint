/**
 * Rule: mcp-sse-invalid-url
 *
 * Validates that SSE transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { mcpServerUrls, validateMcpUrl } from '../../utils/validators/mcp-url';

export const rule: Rule = {
  meta: {
    id: 'mcp-sse-invalid-url',
    name: 'MCP SSE Invalid URL',
    description: 'MCP SSE transport URL must be valid',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/mcp/mcp-sse-invalid-url',
    docs: {
      recommended: true,
      summary: 'Validates that MCP SSE transport URLs are well-formed.',
      rationale: 'An invalid URL prevents Claude Code from connecting to the SSE MCP server.',
      details:
        'This rule checks that the url field of MCP servers with type "sse" is a valid URL by ' +
        'attempting to parse it with the URL constructor. URLs containing variable expansions (${ or $) ' +
        'are skipped since they are resolved at runtime. An invalid URL will prevent Claude Code from ' +
        'connecting to the remote MCP server.',
      examples: {
        incorrect: [
          {
            description: 'SSE server with a malformed URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": "not-a-valid-url"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'SSE server with a valid URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": "https://mcp.example.com/sse"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'SSE server with a variable-expanded URL (skipped)',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": "${MCP_SSE_URL}"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Provide a fully qualified URL including the scheme (http:// or https://). Ensure the URL ' +
        'is well-formed and reachable from the environment where Claude Code runs.',
      relatedRules: ['mcp-sse-empty-url', 'mcp-sse-transport-deprecated'],
    },
  },

  validate: (context) => {
    for (const { url } of mcpServerUrls(context, 'sse')) {
      validateMcpUrl(url, 'SSE', context);
    }
  },
};
