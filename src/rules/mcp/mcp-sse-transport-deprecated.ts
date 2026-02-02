/**
 * Rule: mcp-sse-transport-deprecated
 *
 * Warns that SSE transport is deprecated.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-sse-transport-deprecated',
    name: 'MCP SSE Transport Deprecated',
    description: 'SSE transport is deprecated, use HTTP or WebSocket instead',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-sse-transport-deprecated.md',
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
      if (!hasProperty(server, 'type')) continue;

      if (server.type === 'sse') {
        context.report({
          message:
            'SSE transport is deprecated. Consider using HTTP or WebSocket transport instead.',
        });
      }
    }
  },
};
