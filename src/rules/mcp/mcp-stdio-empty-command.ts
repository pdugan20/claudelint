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
      if (!hasProperty(server, 'transport') || !isObject(server.transport)) continue;
      if (!hasProperty(server.transport, 'type') || server.transport.type !== 'stdio') continue;

      if (!hasProperty(server.transport, 'command') || !isString(server.transport.command)) {
        context.report({
          message: 'MCP stdio transport command cannot be empty',
        });
        continue;
      }

      if (server.transport.command.trim().length === 0) {
        context.report({
          message: 'MCP stdio transport command cannot be empty',
        });
      }
    }
  },
};
