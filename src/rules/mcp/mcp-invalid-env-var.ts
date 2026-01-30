/**
 * Rule: mcp-invalid-env-var
 *
 * Validates environment variable expansion syntax in MCP configuration.
 */

import { Rule } from '../../types/rule';
import { MCPConfigSchema, MCPStdioTransportSchema, MCPSSETransportSchema, MCPHTTPTransportSchema, MCPWebSocketTransportSchema } from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;
type MCPTransport = z.infer<typeof MCPStdioTransportSchema> | z.infer<typeof MCPSSETransportSchema> | z.infer<typeof MCPHTTPTransportSchema> | z.infer<typeof MCPWebSocketTransportSchema>;

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
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/mcp/mcp-invalid-env-var.md',
    schema: z.object({
      pattern: z.string().optional(),
    }),
    defaultOptions: {
      pattern: '^[A-Z_][A-Z0-9_]*$',
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

    // Validate each server's transport
    if (config.mcpServers) {
      for (const [, server] of Object.entries(config.mcpServers)) {
        if (server.transport) {
          validateTransport(context, server.transport);
        }
      }
    }
  },
};

function validateTransport(
  context: Parameters<Rule['validate']>[0],
  transport: MCPTransport
): void {
  // Validate stdio transport
  if (transport.type === 'stdio') {
    if (transport.command) {
      validateVariableExpansion(context, transport.command, 'command');
    }
    if (transport.args) {
      for (const arg of transport.args) {
        validateVariableExpansion(context, arg, 'argument');
      }
    }
  }

  // Validate URL-based transports
  if ('url' in transport && transport.url) {
    validateVariableExpansion(context, transport.url, 'URL');
  }

  // Validate environment variables
  if (transport.env) {
    for (const [key, value] of Object.entries(transport.env)) {
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

  const pattern = (context.options.pattern as string | undefined) ?? '^[A-Z_][A-Z0-9_]*$';
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
        message: `Environment variable name "${actualVarName}" in ${contextDesc} does not match pattern: ${pattern}`,
      });
    }
  }

  // Check for improperly formatted variables (just $VAR without braces)
  const simpleMatches = value.matchAll(SIMPLE_VAR_PATTERN);
  for (const match of simpleMatches) {
    // Skip if this is part of a properly formatted expansion
    if (!value.includes(`\${${match[1]}}`)) {
      context.report({
        message: `Simple variable expansion $${match[1]} in ${contextDesc}. Consider using \${${match[1]}} format.`,
      });
    }
  }
}
