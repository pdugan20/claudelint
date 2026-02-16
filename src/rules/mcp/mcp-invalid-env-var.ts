/**
 * Rule: mcp-invalid-env-var
 *
 * Validates environment variable expansion syntax in MCP configuration.
 */

import { Rule } from '../../types/rule';
import {
  MCPConfigSchema,
  MCPStdioTransportSchema,
  MCPSSETransportSchema,
  MCPHTTPTransportSchema,
  MCPWebSocketTransportSchema,
} from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;
type MCPTransport =
  | z.infer<typeof MCPStdioTransportSchema>
  | z.infer<typeof MCPSSETransportSchema>
  | z.infer<typeof MCPHTTPTransportSchema>
  | z.infer<typeof MCPWebSocketTransportSchema>;

/**
 * Options for mcp-invalid-env-var rule
 */
export interface McpInvalidEnvVarOptions {
  /** Regex pattern for valid environment variable names (default: '^[A-Z_][A-Z0-9_]*$') */
  pattern?: string;
}

// Regex patterns for variable expansion validation
const VAR_EXPANSION_PATTERN = /\$\{([^}]*)\}/g; // Matches ${VAR} or ${VAR:-default}
const SIMPLE_VAR_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g; // Matches $VAR without braces

/**
 * Validates environment variable syntax in MCP transport
 */
export const rule: Rule = {
  meta: {
    id: 'mcp-invalid-env-var',
    name: 'MCP Invalid Environment Variable',
    description: 'Environment variables must use proper expansion syntax',
    category: 'MCP',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '0.2.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-env-var.md',
    schema: z.object({
      pattern: z.string().optional(),
    }),
    defaultOptions: {
      pattern: '^[A-Z_][A-Z0-9_]*$',
    },
    docs: {
      recommended: true,
      summary: 'Validates environment variable expansion syntax in MCP server configurations.',
      rationale:
        'Malformed variable expansions resolve to empty strings at runtime, causing silent connection failures.',
      details:
        'This rule checks that environment variable references in MCP transport fields (command, args, ' +
        'url, headers, and env values) use proper ${VAR} expansion syntax and that variable names match a ' +
        'configurable naming pattern. It warns on empty env values, empty expansion syntax like ${}, ' +
        'variable names that do not match the expected pattern, and bare $VAR references that should ' +
        'use the ${VAR} format. The special variable ${CLAUDE_PLUGIN_ROOT} is always excluded from ' +
        'pattern validation.',
      examples: {
        incorrect: [
          {
            description: 'Bare variable reference without braces',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "command": "node",\n      "env": {\n        "API_KEY": "$MY_API_KEY"\n      }\n    }\n  }\n}',
            language: 'json',
          },
          {
            description: 'Empty environment variable value',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "command": "node",\n      "env": {\n        "API_KEY": ""\n      }\n    }\n  }\n}',
            language: 'json',
          },
        ],
        correct: [
          {
            description: 'Proper variable expansion with braces',
            code: '{\n  "mcpServers": {\n    "my-server": {\n      "command": "node",\n      "env": {\n        "API_KEY": "${MY_API_KEY}"\n      }\n    }\n  }\n}',
            language: 'json',
          },
        ],
      },
      howToFix:
        'Use the ${VAR_NAME} format for environment variable references. Ensure variable names match ' +
        'the expected pattern (default: uppercase letters, digits, and underscores starting with a ' +
        'letter or underscore). Provide non-empty values for all env entries.',
      options: {
        pattern: {
          type: 'string',
          description: 'Regex pattern for valid environment variable names',
          default: '^[A-Z_][A-Z0-9_]*$',
        },
      },
      optionExamples: [
        {
          description: 'Allow lowercase environment variable names',
          config: { pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$' },
        },
      ],
      relatedRules: ['mcp-stdio-empty-command', 'mcp-http-invalid-url', 'mcp-sse-invalid-url'],
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

    // Validate each server (transport fields are now flat on the server)
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        validateTransport(context, server as MCPTransport);
      }
    }
  },
};

function validateTransport(context: Parameters<Rule['validate']>[0], server: MCPTransport): void {
  // Validate stdio transport
  if (server.type === 'stdio' || ('command' in server && server.command)) {
    if (server.command) {
      validateVariableExpansion(context, server.command, 'command');
    }
    if (server.args) {
      for (const arg of server.args) {
        validateVariableExpansion(context, arg, 'argument');
      }
    }
  }

  // Validate URL-based transports
  if ('url' in server && server.url) {
    validateVariableExpansion(context, server.url, 'URL');
  }

  // Validate headers (SSE, HTTP transports)
  if ('headers' in server && server.headers) {
    for (const [key, value] of Object.entries(server.headers)) {
      validateVariableExpansion(context, value, `header ${key}`);
    }
  }

  // Validate environment variables
  if (server.env) {
    for (const [key, value] of Object.entries(server.env)) {
      // Check for empty values
      if (!value || value.trim().length === 0) {
        context.report({
          message: `Empty value for environment variable: ${key}`,
        });
      } else {
        // Only validate expansion if value is not empty
        validateVariableExpansion(context, value, `environment variable ${key}`);
      }
    }
  }
}

function validateVariableExpansion(
  context: Parameters<Rule['validate']>[0],
  value: string,
  contextDesc: string
): void {
  // Skip ${CLAUDE_PLUGIN_ROOT} - it's a special variable
  if (value.includes('${CLAUDE_PLUGIN_ROOT}')) {
    return;
  }

  const pattern = (context.options as McpInvalidEnvVarOptions).pattern ?? '^[A-Z_][A-Z0-9_]*$';
  const varNameRegex = new RegExp(pattern);

  // Check for properly formatted variable expansion ${VAR} or ${VAR:-default}
  const expansionMatches = value.matchAll(VAR_EXPANSION_PATTERN);
  for (const match of expansionMatches) {
    const varName = match[1];
    if (varName.length === 0) {
      context.report({
        message: `Invalid variable expansion syntax in ${contextDesc}: ${match[0]}`,
      });
      continue;
    }

    // Extract just the variable name (before any :- default)
    const actualVarName = varName.split(':-')[0].trim();

    // Skip CLAUDE_PLUGIN_ROOT from pattern validation
    if (actualVarName === 'CLAUDE_PLUGIN_ROOT') {
      continue;
    }

    // Validate variable name against pattern
    if (!varNameRegex.test(actualVarName)) {
      context.report({
        message: `Invalid environment variable name: "${actualVarName}"`,
      });
    }
  }

  // Check for improperly formatted variables (just $VAR without braces)
  const simpleMatches = value.matchAll(SIMPLE_VAR_PATTERN);
  for (const match of simpleMatches) {
    // Skip if this is part of a properly formatted expansion
    if (!value.includes(`\${${match[1]}}`)) {
      context.report({
        message: `Unbraced variable expansion: $${match[1]}`,
      });
    }
  }
}
