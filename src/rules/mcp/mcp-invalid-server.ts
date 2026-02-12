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
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-server.md',
    docs: {
      recommended: false,
      summary: 'Validates that MCP server names are unique within the configuration.',
      details:
        'This rule is deprecated and no longer performs any validation. It originally checked for ' +
        'duplicate MCP server names, but the configuration format was changed to use object keys ' +
        'for server names, making duplicates impossible at the JSON level. The rule is retained for ' +
        'backward compatibility but will be removed in a future version.',
      examples: {
        incorrect: [
          {
            description: 'Duplicate server names (no longer possible with object-key format)',
            code: '{\n  "mcpServers": {\n    "my-server": { "command": "npx", "args": ["server-a"] },\n    "my-server": { "command": "npx", "args": ["server-b"] }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Unique server names as object keys',
            code: '{\n  "mcpServers": {\n    "server-a": { "command": "npx", "args": ["server-a"] },\n    "server-b": { "command": "npx", "args": ["server-b"] }\n  }\n}',
            language: 'json',
          },
        ],
      },
      whenNotToUse: 'This rule is deprecated and performs no checks. It can be safely disabled.',
      relatedRules: ['mcp-invalid-transport'],
    },
  },

  validate: () => {
    // This rule is no longer needed since server names are object keys
    // Object keys in JSON are inherently unique
    return;
  },
};
