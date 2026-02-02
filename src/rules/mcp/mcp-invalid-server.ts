/**
 * Rule: mcp-invalid-server
 *
 * This rule is deprecated as duplicate server names are now impossible.
 * Server names are object keys in mcpServers, so they are inherently unique.
 */

import { Rule } from '../../types/rule';

/**
 * Validates MCP server names (deprecated - no longer needed)
 */
export const rule: Rule = {
  meta: {
    id: 'mcp-invalid-server',
    name: 'MCP Invalid Server',
    description: 'MCP server names must be unique (deprecated: names are now object keys)',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: true,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-server.md',
  },

  validate: () => {
    // This rule is no longer needed since server names are object keys
    // Object keys in JSON are inherently unique
    return;
  },
};
