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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-stdio-empty-command.md',
    docs: {
      recommended: true,
      summary: 'Ensures that MCP stdio transport servers have a non-empty command field.',
      details:
        'This rule validates that every MCP server using the stdio transport has a command property ' +
        'that is present, is a string, and is not empty or whitespace-only. A server is considered ' +
        'stdio if it has type set to "stdio" or has a command field. Without a valid command, the MCP ' +
        'server cannot be started, causing a runtime failure when Claude Code tries to connect.',
      examples: {
        incorrect: [
          {
            description: 'Stdio server with an empty command',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "type": "stdio",\n      "command": ""\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'Stdio server missing the command field entirely',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "type": "stdio",\n      "args": ["--port", "3000"]\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Stdio server with a valid command',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem"]\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a non-empty command string to the MCP server configuration. The command should be the ' +
        'executable that starts the MCP server process (e.g., "npx", "node", "python").',
      relatedRules: [],
    },
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
      const isStdio =
        (hasProperty(server, 'type') && server.type === 'stdio') || hasProperty(server, 'command');
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
