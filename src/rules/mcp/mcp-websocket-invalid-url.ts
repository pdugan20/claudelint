/**
 * Rule: mcp-websocket-invalid-url
 *
 * Validates that WebSocket transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { formatError } from '../../utils/validators/helpers';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-invalid-url',
    name: 'MCP WebSocket Invalid URL',
    description: 'MCP WebSocket transport URL must be valid',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-websocket-invalid-url.md',
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
        new URL(url);
      } catch (error) {
        context.report({
          message: `Invalid URL in WebSocket transport: ${formatError(error)}`,
        });
      }
    }
  },
};
