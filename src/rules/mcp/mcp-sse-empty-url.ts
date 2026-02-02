/**
 * Rule: mcp-sse-empty-url
 *
 * Validates that SSE transport has a non-empty URL.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-sse-empty-url',
    name: 'MCP SSE Empty URL',
    description: 'MCP SSE transport URL cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-sse-empty-url.md',
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
      if (!hasProperty(server, 'type') || server.type !== 'sse') continue;

      if (!hasProperty(server, 'url') || !isString(server.url)) {
        context.report({
          message: 'MCP SSE transport URL cannot be empty',
        });
        continue;
      }

      if (server.url.trim().length === 0) {
        context.report({
          message: 'MCP SSE transport URL cannot be empty',
        });
      }
    }
  },
};
