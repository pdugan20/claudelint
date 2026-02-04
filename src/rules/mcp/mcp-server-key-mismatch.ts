/**
 * Rule: mcp-server-key-mismatch
 *
 * This rule is deprecated as server names are no longer a property.
 * Server names are object keys in mcpServers, not a field on the server.
 */

import { Rule } from '../../types/rule';

export const rule: Rule = {
  meta: {
    id: 'mcp-server-key-mismatch',
    name: 'MCP Server Key Mismatch',
    description:
      'Server key should match server name property (deprecated: names are now object keys)',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: true,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-server-key-mismatch.md',
  },

  validate: () => {
    // This rule is no longer needed since server names are object keys
    // There is no separate name property to mismatch with
    return;
  },
};
