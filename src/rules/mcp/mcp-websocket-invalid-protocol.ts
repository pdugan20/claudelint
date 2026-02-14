/**
 * Rule: mcp-websocket-invalid-protocol
 *
 * Validates that WebSocket URLs use ws:// or wss:// protocol.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-invalid-protocol',
    name: 'MCP WebSocket Invalid Protocol',
    description: 'WebSocket URLs should use ws:// or wss:// protocol',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-websocket-invalid-protocol.md',
    docs: {
      recommended: true,
      summary: 'Warns when a WebSocket MCP server URL does not use ws:// or wss:// protocol.',
      rationale:
        'Using http:// or https:// instead of ws:// or wss:// causes WebSocket connection failures.',
      details:
        'This rule parses the url field of MCP servers with type "websocket" and checks that the ' +
        'protocol is ws: or wss:. Using an incorrect protocol such as http:// or https:// may ' +
        'cause connection failures or unexpected behavior. URLs containing variable expansions ' +
        '(${ or $) are skipped since they are resolved at runtime. Completely invalid URLs are ' +
        'caught by the mcp-websocket-invalid-url rule instead.',
      examples: {
        incorrect: [
          {
            description: 'WebSocket server using https:// instead of wss://',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "https://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'WebSocket server using wss:// protocol',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "wss://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'WebSocket server using ws:// protocol for local development',
            code: '{\n  "mcpServers": {\n    "local": {\n      "type": "websocket",\n      "url": "ws://localhost:8080/ws"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Change the URL scheme to ws:// (unencrypted) or wss:// (encrypted). Use wss:// for ' +
        'production servers and ws:// only for local development.',
      relatedRules: ['mcp-websocket-invalid-url', 'mcp-websocket-empty-url'],
    },
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    let config: unknown;
    try {
      config = JSON.parse(fileContent);
    } catch {
      return;
    }

    if (!hasProperty(config, 'mcpServers') || !isObject(config.mcpServers)) {
      return;
    }

    for (const server of Object.values(config.mcpServers)) {
      if (!isObject(server)) continue;
      if (!hasProperty(server, 'type') || server.type !== 'websocket') continue;
      if (!hasProperty(server, 'url') || !isString(server.url)) continue;

      const url = server.url;

      // Skip validation if URL contains variable expansion
      if (url.includes('${') || url.includes('$')) {
        continue;
      }

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'ws:' && parsedUrl.protocol !== 'wss:') {
          context.report({
            message: `WebSocket URL should use ws:// or wss:// protocol, found ${parsedUrl.protocol}`,
          });
        }
      } catch {
        // Invalid URL will be caught by mcp-websocket-invalid-url
      }
    }
  },
};
