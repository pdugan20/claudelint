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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-websocket-invalid-protocol.md',
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
      if (!hasProperty(server, 'transport') || !isObject(server.transport)) continue;
      if (!hasProperty(server.transport, 'type') || server.transport.type !== 'websocket') continue;
      if (!hasProperty(server.transport, 'url') || !isString(server.transport.url)) continue;

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
  },
};
