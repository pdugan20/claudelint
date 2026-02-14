/**
 * Rule: mcp-websocket-invalid-url
 *
 * Validates that WebSocket transport URL is valid.
 */

import { Rule } from '../../types/rule';
import { formatError } from '../../utils/validators/helpers';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-websocket-invalid-url',
    name: 'MCP WebSocket Invalid URL',
    description: 'MCP WebSocket transport URL must be valid',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-websocket-invalid-url.md',
    docs: {
      recommended: true,
      summary: 'Validates that MCP WebSocket transport URLs are well-formed.',
      rationale:
        'An invalid URL prevents Claude Code from establishing a WebSocket connection to the MCP server.',
      details:
        'This rule checks that the url field of MCP servers with type "websocket" is a valid URL ' +
        'by attempting to parse it with the URL constructor. URLs containing variable expansions ' +
        '(${ or $) are skipped since they are resolved at runtime. An invalid URL will prevent ' +
        'Claude Code from establishing a WebSocket connection to the MCP server.',
      examples: {
        incorrect: [
          {
            description: 'WebSocket server with a malformed URL',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "not-a-valid-url"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'WebSocket server with a valid URL',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "wss://mcp.example.com/ws"\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'WebSocket server with a variable-expanded URL (skipped)',
            code: '{\n  "mcpServers": {\n    "realtime": {\n      "type": "websocket",\n      "url": "${MCP_WS_URL}"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Provide a fully qualified URL with a ws:// or wss:// scheme. Ensure the URL is ' +
        'well-formed and reachable from the environment where Claude Code runs.',
      relatedRules: ['mcp-websocket-empty-url', 'mcp-websocket-invalid-protocol'],
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
      if (!hasProperty(server, 'type') || server.type !== 'websocket') continue;
      if (!hasProperty(server, 'url') || !isString(server.url)) continue;

      const url = server.url;

      // P4-3: Skip validation only for env var placeholders, not any URL containing $
      if (/\$\{[A-Z_]+\}|\$[A-Z_]+\b/.test(url)) {
        continue;
      }

      try {
        new URL(url);
      } catch (error) {
        context.report({
          message: `Invalid URL in WebSocket transport: ${formatError(error)}`,
        });
      }
    }
  },
};
