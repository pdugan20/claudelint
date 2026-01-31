/**
 * Rule: mcp-stdio-empty-command
 *
 * Validates that stdio transport has a non-empty command.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'mcp-stdio-empty-command',
    name: 'MCP Stdio Empty Command',
    description: 'MCP stdio transport command cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/mcp/mcp-stdio-empty-command.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    let config: {
      mcpServers?: Record<string, { transport?: { type?: string; command?: string } }>;
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
      if (server.transport?.type === 'stdio') {
        const command = server.transport.command;
        if (!command || command.trim().length === 0) {
          context.report({
            message: 'MCP stdio transport command cannot be empty',
          });
        }
      }
    }
  },
};
