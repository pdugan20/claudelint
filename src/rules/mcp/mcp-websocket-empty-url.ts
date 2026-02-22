/**
 * Rule: mcp-websocket-empty-url
 *
 * Validates that WebSocket transport has a non-empty URL.
 */

import { Rule } from '../../types/rule';
import { mcpServerUrls, mcpServersMissingUrl } from '../../utils/validators/mcp-url';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-empty-url',
    name: 'MCP WebSocket Empty URL',
    description: 'MCP WebSocket transport URL cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/mcp/mcp-websocket-empty-url',
    docs: {
      recommended: true,
      summary: 'Ensures that MCP WebSocket transport servers have a non-empty URL.',
      rationale:
        'A blank URL prevents Claude Code from establishing a WebSocket connection, causing runtime failures.',
      details:
        'This rule checks that MCP servers configured with type "websocket" include a url field ' +
        'that is present and non-empty. A missing or blank URL means Claude Code cannot establish ' +
        'a WebSocket connection to the MCP server, resulting in connection failures at runtime.',
      examples: {
        incorrect: [
          {
            description: 'WebSocket server with an empty URL string',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": ""\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'WebSocket server with the url field missing',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'WebSocket server with a valid URL',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "wss://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a non-empty url field to the WebSocket server configuration. The URL should use ' +
        'the ws:// or wss:// protocol scheme.',
      relatedRules: ['mcp-websocket-invalid-url', 'mcp-websocket-invalid-protocol'],
    },
  },

  validate: (context) => {
    for (const _ of mcpServersMissingUrl(context, 'websocket')) {
      context.report({ message: 'MCP WebSocket transport URL cannot be empty' });
    }
    for (const { url } of mcpServerUrls(context, 'websocket')) {
      if (url.trim().length === 0) {
        context.report({ message: 'MCP WebSocket transport URL cannot be empty' });
      }
    }
  },
};
