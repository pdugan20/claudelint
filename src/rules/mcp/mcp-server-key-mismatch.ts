/**
 * Rule: mcp-server-key-mismatch
 *
 * Validates that MCP server object key matches the server's name property.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-server-key-mismatch',
    name: 'MCP Server Key Mismatch',
    description: 'Server key should match server name property',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-server-key-mismatch.md',
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

    for (const [serverKey, server] of Object.entries(config.mcpServers)) {
      if (!isObject(server)) continue;
      if (!hasProperty(server, 'name') || !isString(server.name)) continue;

      if (server.name !== serverKey) {
        context.report({
          message: `Server key "${serverKey}" does not match server name "${server.name}"`,
        });
      }
    }
  },
};
