/**
 * Rule: mcp-sse-empty-url
 *
 * Validates that SSE transport has a non-empty URL.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-sse-empty-url',
    name: 'MCP SSE Empty URL',
    description: 'MCP SSE transport URL cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-sse-empty-url.md',
    docs: {
      recommended: true,
      summary: 'Ensures that MCP SSE transport servers have a non-empty URL.',
      details:
        'This rule checks that MCP servers configured with type "sse" include a url field that is ' +
        'present and non-empty. A missing or blank URL means Claude Code cannot connect to the ' +
        'SSE endpoint. Note that the SSE transport itself is deprecated in favor of HTTP; consider ' +
        'migrating to the http transport type.',
      examples: {
        incorrect: [
          {
            description: 'SSE server with an empty URL string',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": ""\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'SSE server with the url field missing',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'SSE server with a valid URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "sse",\n      "url": "https://mcp.example.com/sse"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a non-empty url field to the SSE server configuration. Consider migrating to the ' +
        'http transport type, as SSE is deprecated.',
      relatedRules: ['mcp-sse-invalid-url', 'mcp-sse-transport-deprecated'],
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
      if (!hasProperty(server, 'type') || server.type !== 'sse') continue;

      if (!hasProperty(server, 'url') || !isString(server.url)) {
        context.report({
          message: 'MCP SSE transport URL cannot be empty',
        });
        continue;
      }

      if (server.url.trim().length === 0) {
        context.report({
          message: 'MCP SSE transport URL cannot be empty',
        });
      }
    }
  },
};
