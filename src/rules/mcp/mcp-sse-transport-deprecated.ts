/**
 * Rule: mcp-sse-transport-deprecated
 *
 * Warns that SSE transport is deprecated.
 */

import { Rule } from '../../types/rule';

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
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/mcp/mcp-sse-transport-deprecated.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    let config: {
      mcpServers?: Record<string, { transport?: { type?: string } }>;
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
      if (server.transport?.type === 'sse') {
        context.report({
          message:
            'SSE transport is deprecated. Consider using HTTP or WebSocket transport instead.',
        });
      }
    }
  },
};
