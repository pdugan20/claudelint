/**
 * Rule: mcp-sse-transport-deprecated
 *
 * Warns that SSE transport is deprecated.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-sse-transport-deprecated',
    name: 'MCP SSE Transport Deprecated',
    description: 'SSE transport is deprecated, use HTTP or WebSocket instead',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://claudelint.com/rules/mcp/mcp-sse-transport-deprecated',
    docs: {
      recommended: true,
      summary: 'Warns when an MCP server uses the deprecated SSE transport type.',
      rationale:
        'SSE transport will be removed in a future release; migrate to HTTP streamable transport now to avoid breakage.',
      details:
        'The Server-Sent Events (SSE) transport for MCP servers is deprecated in favor of the ' +
        'HTTP streamable transport. This rule emits a warning whenever a server has type set to ' +
        '"sse" so that configurations can be migrated before SSE support is removed entirely. ' +
        'The HTTP transport offers better bidirectional communication and is the recommended ' +
        'replacement.',
      examples: {
        incorrect: [
          {
            description: 'Server using the deprecated SSE transport',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": "https://mcp.example.com/sse"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Server using the recommended HTTP transport',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http",\n      "url": "https://mcp.example.com/api"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'Server using WebSocket transport',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "websocket",\n      "url": "wss://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Change the server type from "sse" to "http" and update the url to point to the HTTP ' +
        'streamable endpoint. Alternatively, use "websocket" if the server supports it.',
      whenNotToUse:
        'Disable this rule if you are intentionally targeting an MCP server that only supports ' +
        'the SSE transport and cannot be upgraded.',
      relatedRules: ['mcp-sse-empty-url', 'mcp-sse-invalid-url', 'mcp-invalid-transport'],
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
      if (!hasProperty(server, 'type')) continue;

      if (server.type === 'sse') {
        context.report({
          message: 'SSE transport is deprecated',
        });
      }
    }
  },
};
