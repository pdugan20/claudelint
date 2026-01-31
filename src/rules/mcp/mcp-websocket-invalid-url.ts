/**
 * Rule: mcp-websocket-invalid-url
 *
 * Validates that WebSocket transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { formatError } from '../../utils/validation-helpers';

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
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/mcp/mcp-websocket-invalid-url.md',
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
          new URL(url);
        } catch (error) {
          context.report({
            message: `Invalid URL in WebSocket transport: ${formatError(error)}`,
          });
        }
      }
    }
  },
};
