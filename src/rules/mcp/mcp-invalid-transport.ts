/**
 * Rule: mcp-invalid-transport
 *
 * Validates MCP transport types are one of the supported values.
 */

import { Rule } from '../../types/rule';
import { VALID_MCP_TRANSPORT_TYPES } from '../../schemas/constants';
import { MCPConfigSchema } from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;

/**
 * Validates MCP transport type
 */
export const rule: Rule = {
  meta: {
    id: 'mcp-invalid-transport',
    name: 'MCP Invalid Transport',
    description: 'MCP transport type must be one of the supported values',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-transport.md',
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

    // Validate each server's transport type
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.transport && server.transport.type) {
          const transportType = server.transport.type;
          if (!(VALID_MCP_TRANSPORT_TYPES as readonly string[]).includes(transportType)) {
            context.report({
              message: `Invalid MCP transport type: ${transportType}. Must be one of: ${VALID_MCP_TRANSPORT_TYPES.join(', ')}`,
            });
          }
        }
      }
    }
  },
};
