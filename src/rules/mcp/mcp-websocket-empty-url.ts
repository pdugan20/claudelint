/**
 * Rule: mcp-websocket-empty-url
 *
 * Validates that WebSocket transport has a non-empty URL.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-empty-url',
    name: 'MCP WebSocket Empty URL',
    description: 'MCP WebSocket transport URL cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-websocket-empty-url.md',
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

      if (!hasProperty(server.transport, 'url') || !isString(server.transport.url)) {
        context.report({
          message: 'MCP WebSocket transport URL cannot be empty',
        });
        continue;
      }

      if (server.transport.url.trim().length === 0) {
        context.report({
          message: 'MCP WebSocket transport URL cannot be empty',
        });
      }
    }
  },
};
