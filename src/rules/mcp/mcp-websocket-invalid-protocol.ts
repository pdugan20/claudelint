/**
 * Rule: mcp-websocket-invalid-protocol
 *
 * Validates that WebSocket URLs use ws:// or wss:// protocol.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-invalid-protocol',
    name: 'MCP WebSocket Invalid Protocol',
    description: 'WebSocket URLs should use ws:// or wss:// protocol',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/mcp/mcp-websocket-invalid-protocol.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    let config: {
      mcpServers?: Record<string, { transport?: { type?: string; url?: string } }>;
    };
    try {
      config = JSON.parse(fileContent);
    } catch {
      return;
    }

    if (!config.mcpServers) {
      return;
    }

    for (const server of Object.values(config.mcpServers)) {
      if (server.transport?.type === 'websocket' && server.transport.url) {
        const url = server.transport.url;

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
    }
  },
};
