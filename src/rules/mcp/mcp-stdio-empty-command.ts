/**
 * Rule: mcp-stdio-empty-command
 *
 * Validates that stdio transport has a non-empty command.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

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
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-stdio-empty-command.md',
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

      // Check if this is a stdio transport (has type: 'stdio' or has command field)
      const isStdio = (hasProperty(server, 'type') && server.type === 'stdio') || hasProperty(server, 'command');
      if (!isStdio) continue;

      if (!hasProperty(server, 'command') || !isString(server.command)) {
        context.report({
          message: 'MCP stdio transport command cannot be empty',
        });
        continue;
      }

      if (server.command.trim().length === 0) {
        context.report({
          message: 'MCP stdio transport command cannot be empty',
        });
      }
    }
  },
};
