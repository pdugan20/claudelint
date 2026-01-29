/**
 * Rule: mcp-invalid-env-var
 *
 * Validates environment variable expansion syntax in MCP configuration.
 */

import { Rule } from '../../types/rule';
import { VAR_EXPANSION_PATTERN, SIMPLE_VAR_PATTERN } from '../../validators/constants';
import { MCPConfigSchema, MCPStdioTransportSchema, MCPSSETransportSchema, MCPHTTPTransportSchema, MCPWebSocketTransportSchema } from '../../validators/schemas';
import { z } from 'zod';

type MCPConfig = z.infer<typeof MCPConfigSchema>;
type MCPTransport = z.infer<typeof MCPStdioTransportSchema> | z.infer<typeof MCPSSETransportSchema> | z.infer<typeof MCPHTTPTransportSchema> | z.infer<typeof MCPWebSocketTransportSchema>;

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
      validateVariableExpansion(context, value, `environment variable ${key}`);
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

  // Check for properly formatted variable expansion ${VAR} or ${VAR:-default}
  const expansionMatches = value.matchAll(VAR_EXPANSION_PATTERN);
  for (const match of expansionMatches) {
    const varName = match[1];
    if (varName.length === 0) {
      context.report({
        message: `Invalid variable expansion syntax in ${contextDesc}: ${match[0]}`,
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
