/**
 * Rule: mcp-invalid-server
 *
 * Validates MCP server configuration for duplicate names.
 */

import { Rule } from '../../types/rule';
import { MCPConfigSchema } from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;

/**
 * Validates MCP server names
 */
export const rule: Rule = {
  meta: {
    id: 'mcp-invalid-server',
    name: 'MCP Invalid Server',
    description: 'MCP server names must be unique',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claude-code-lint/blob/main/docs/rules/mcp/mcp-invalid-server.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate .mcp.json files
    if (!filePath.endsWith('.mcp.json')) {
      return;
    }

    // Parse JSON
    let config: MCPConfig;
    try {
      config = JSON.parse(fileContent) as MCPConfig;
    } catch {
      // JSON parse errors are handled by schema validation
      return;
    }

    // Check for duplicate server names
    const serverNames = new Set<string>();
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.name) {
          // Check for duplicates
          if (serverNames.has(server.name)) {
            context.report({
              message: `Duplicate MCP server name: ${server.name}`,
            });
          } else {
            serverNames.add(server.name);
          }
        }
      }
    }
  },
};
