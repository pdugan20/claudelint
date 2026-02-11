/**
 * Rule: mcp-http-empty-url
 *
 * Validates that HTTP transport has a non-empty URL.
 */

import { Rule } from '../../types/rule';
import { hasProperty, isObject, isString } from '../../utils/type-guards';

export const rule: Rule = {
  meta: {
    id: 'mcp-http-empty-url',
    name: 'MCP HTTP Empty URL',
    description: 'MCP HTTP transport URL cannot be empty',
    category: 'MCP',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl: 'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-http-empty-url.md',
    docs: {
      recommended: true,
      summary: 'Ensures that MCP HTTP transport servers have a non-empty URL.',
      details:
        'This rule checks that MCP servers configured with type "http" include a url field that is ' +
        'present and non-empty. A missing or blank URL means Claude Code cannot connect to the remote ' +
        'MCP server, resulting in silent failures or confusing runtime errors.',
      examples: {
        incorrect: [
          {
            description: 'HTTP server with an empty URL string',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http",\n      "url": ""\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'HTTP server with the url field missing entirely',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http"\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'HTTP server with a valid URL',
            code: '{\n  "mcpServers": {\n    "remote": {\n      "type": "http",\n      "url": "https://mcp.example.com/api"\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Add a non-empty url field to the MCP server configuration. The URL should be a fully ' +
        'qualified address including the scheme (http:// or https://).',
      relatedRules: ['mcp-http-invalid-url', 'mcp-invalid-server'],
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
      if (!hasProperty(server, 'type') || server.type !== 'http') continue;

      if (!hasProperty(server, 'url') || !isString(server.url)) {
        context.report({
          message: 'MCP HTTP transport URL cannot be empty',
        });
        continue;
      }

      if (server.url.trim().length === 0) {
        context.report({
          message: 'MCP HTTP transport URL cannot be empty',
        });
      }
    }
  },
};
