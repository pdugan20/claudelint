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
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-server-key-mismatch.md',
    docs: {
      recommended: false,
      summary:
        'Previously checked that the server object key matched a name property (deprecated).',
      details:
        'This rule is deprecated and no longer performs any validation. In earlier versions of the ' +
        'MCP configuration schema, servers had a separate name property that was expected to match ' +
        'the object key. Server names are now derived from the object key itself, so there is no ' +
        'name property to mismatch.',
      examples: {
        incorrect: [
          {
            description: 'Older config format with mismatched name (no longer applicable)',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "name": "other-name",\n      "command": "npx",\n      "args": ["-y", "@my/mcp-server"]\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Current config format using object key as server name',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "command": "npx",\n      "args": ["-y", "@my/mcp-server"]\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      whenNotToUse:
        'This rule is deprecated and can always be safely disabled. It performs no validation.',
    },
  },

  validate: () => {
    // This rule is no longer needed since server names are object keys
    // There is no separate name property to mismatch with
    return;
  },
};
