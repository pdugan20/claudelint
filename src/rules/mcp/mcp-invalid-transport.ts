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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-transport.md',
    docs: {
      recommended: true,
      summary: 'Validates that MCP server transport types are supported values.',
      rationale:
        'An unrecognized transport type prevents Claude Code from establishing any connection to the MCP server.',
      details:
        'This rule checks that the type field of each MCP server is one of the supported transport ' +
        'types: stdio, sse, http, or websocket. An unrecognized transport type will prevent Claude ' +
        'Code from establishing a connection to the MCP server. Servers without an explicit type ' +
        'field are skipped because the type can be inferred from the presence of a command field.',
      examples: {
        incorrect: [
          {
            description: 'Server with an unsupported transport type',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "type": "grpc",\n      "url": "https://mcp.example.com"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Server with a valid HTTP transport type',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "type": "http",\n      "url": "https://mcp.example.com"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'Server with a valid stdio transport type',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ["-y", "@my/mcp-server"]\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Change the type field to one of the supported values: stdio, sse, http, or websocket. ' +
        'Note that sse is deprecated in favor of http.',
      relatedRules: ['mcp-sse-transport-deprecated'],
    },
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

    // Validate each server's transport type (transport fields are now flat on the server)
    if (config.mcpServers) {
      for (const [, rawServer] of Object.entries(config.mcpServers)) {
        const server = rawServer as Record<string, unknown>;
        // Server can have optional type field, or be inferred from presence of command
        if (server.type) {
          const transportType = server.type as string;
          if (!(VALID_MCP_TRANSPORT_TYPES as readonly string[]).includes(transportType)) {
            context.report({
              message: `Invalid transport type: ${transportType}`,
            });
          }
        }
      }
    }
  },
};
