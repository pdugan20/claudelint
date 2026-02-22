/**
 * Rule: mcp-websocket-invalid-url
 *
 * Validates that WebSocket transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { mcpServerUrls, validateMcpUrl } from '../../utils/validators/mcp-url';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-invalid-url',
    name: 'MCP WebSocket Invalid URL',
    description: 'MCP WebSocket transport URL must be valid',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/mcp/mcp-websocket-invalid-url',
    docs: {
      recommended: true,
      summary: 'Validates that MCP WebSocket transport URLs are well-formed.',
      rationale:
        'An invalid URL prevents Claude Code from establishing a WebSocket connection to the MCP server.',
      details:
        'This rule checks that the url field of MCP servers with type "websocket" is a valid URL ' +
        'by attempting to parse it with the URL constructor. URLs containing variable expansions ' +
        '(${ or $) are skipped since they are resolved at runtime. An invalid URL will prevent ' +
        'Claude Code from establishing a WebSocket connection to the MCP server.',
      examples: {
        incorrect: [
          {
            description: 'WebSocket server with a malformed URL',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "not-a-valid-url"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'WebSocket server with a valid URL',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "wss://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'WebSocket server with a variable-expanded URL (skipped)',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "${MCP_WS_URL}"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Provide a fully qualified URL with a ws:// or wss:// scheme. Ensure the URL is ' +
        'well-formed and reachable from the environment where Claude Code runs.',
      relatedRules: ['mcp-websocket-empty-url', 'mcp-websocket-invalid-protocol'],
    },
  },

  validate: (context) => {
    for (const { url } of mcpServerUrls(context, 'websocket')) {
      validateMcpUrl(url, 'WebSocket', context);
    }
  },
};
