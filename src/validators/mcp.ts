import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findMcpFiles } from '../utils/file-system';
import { z } from 'zod';
import { VAR_EXPANSION_PATTERN, SIMPLE_VAR_PATTERN } from './constants';
import { VALID_MCP_TRANSPORT_TYPES } from '../schemas/constants';
import {
  MCPConfigSchema,
  MCPServerSchema,
  MCPStdioTransportSchema,
  MCPSSETransportSchema,
  MCPHTTPTransportSchema,
  MCPWebSocketTransportSchema,
} from './schemas';
// Import rules to ensure they're registered
import '../rules';
import { ValidatorRegistry } from '../utils/validator-factory';
import { validateEnvironmentVariables, formatError } from '../utils/validation-helpers';

/**
 * Options specific to MCP validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type MCPValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates MCP (Model Context Protocol) server configuration files
 */
export class MCPValidator extends JSONConfigValidator<typeof MCPConfigSchema> {
  private serverNames = new Set<string>();

  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findMcpFiles(basePath);
  }

  protected getSchema(): typeof MCPConfigSchema {
    return MCPConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No .mcp.json files found';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async validateConfig(
    filePath: string,
    config: z.infer<typeof MCPConfigSchema>
  ): Promise<void> {
    // Reset server names for this file
    this.serverNames.clear();

    // Validate each MCP server
    for (const [serverKey, server] of Object.entries(config.mcpServers)) {
      this.validateMCPServer(filePath, serverKey, server);
    }
  }

  private validateMCPServer(
    filePath: string,
    serverKey: string,
    server: z.infer<typeof MCPServerSchema>
  ): void {
    // Check server name uniqueness
    if (this.serverNames.has(server.name)) {
      this.reportError(`Duplicate MCP server name: ${server.name}`, filePath, undefined, 'mcp-invalid-server');
    } else {
      this.serverNames.add(server.name);
    }

    // Validate server key matches name
    if (server.name !== serverKey) {
      this.reportWarning(
        `Server key "${serverKey}" does not match server name "${server.name}"`,
        filePath
      );
    }

    // Validate transport
    this.validateTransport(filePath, server.transport);
  }

  private validateTransport(
    filePath: string,
    transport:
      | z.infer<typeof MCPStdioTransportSchema>
      | z.infer<typeof MCPSSETransportSchema>
      | z.infer<typeof MCPHTTPTransportSchema>
      | z.infer<typeof MCPWebSocketTransportSchema>
  ): void {
    // Validate transport type
    if (!(VALID_MCP_TRANSPORT_TYPES as readonly string[]).includes(transport.type)) {
      this.reportError(
        `Invalid MCP transport type: ${transport.type}. Must be one of: ${VALID_MCP_TRANSPORT_TYPES.join(', ')}`,
        filePath,
        undefined,
        'mcp-invalid-transport'
      );
    }

    if (transport.type === 'stdio') {
      this.validateStdioTransport(filePath, transport);
    } else if (transport.type === 'sse') {
      this.validateSSETransport(filePath, transport);
    } else if (transport.type === 'http') {
      this.validateHTTPTransport(filePath, transport);
    } else if (transport.type === 'websocket') {
      this.validateWebSocketTransport(filePath, transport);
    }

    // Validate environment variables if present
    if (transport.env) {
      this.validateEnvironmentVariables(filePath, transport.env);
    }
  }

  private validateStdioTransport(
    filePath: string,
    transport: z.infer<typeof MCPStdioTransportSchema>
  ): void {
    // Validate command is not empty
    if (!transport.command || transport.command.trim().length === 0) {
      this.reportError('MCP stdio transport command cannot be empty', filePath);
      return;
    }

    // Check for variable expansion in command
    this.validateVariableExpansion(filePath, transport.command, 'command');

    // Validate args if present
    if (transport.args) {
      for (const arg of transport.args) {
        this.validateVariableExpansion(filePath, arg, 'argument');
      }
    }
  }

  private validateSSETransport(
    filePath: string,
    transport: z.infer<typeof MCPSSETransportSchema>
  ): void {
    // SSE transport is deprecated
    this.reportWarning(
      'SSE transport is deprecated. Consider using HTTP or WebSocket transport instead.',
      filePath
    );

    // Validate URL is not empty
    if (!transport.url || transport.url.trim().length === 0) {
      this.reportError('MCP SSE transport URL cannot be empty', filePath);
      return;
    }

    // Basic URL validation
    try {
      // Check if it contains variable expansion first
      if (!this.containsVariableExpansion(transport.url)) {
        new URL(transport.url);
      }
    } catch (error) {
      this.reportError(
        `Invalid URL in SSE transport: ${formatError(error)}`,
        filePath
      );
    }

    // Check for variable expansion in URL
    this.validateVariableExpansion(filePath, transport.url, 'URL');
  }

  private validateHTTPTransport(
    filePath: string,
    transport: z.infer<typeof MCPHTTPTransportSchema>
  ): void {
    // Validate URL is not empty
    if (!transport.url || transport.url.trim().length === 0) {
      this.reportError('MCP HTTP transport URL cannot be empty', filePath);
      return;
    }

    // Basic URL validation
    try {
      if (!this.containsVariableExpansion(transport.url)) {
        new URL(transport.url);
      }
    } catch (error) {
      this.reportError(
        `Invalid URL in HTTP transport: ${formatError(error)}`,
        filePath
      );
    }

    // Check for variable expansion in URL
    this.validateVariableExpansion(filePath, transport.url, 'URL');
  }

  private validateWebSocketTransport(
    filePath: string,
    transport: z.infer<typeof MCPWebSocketTransportSchema>
  ): void {
    // Validate URL is not empty
    if (!transport.url || transport.url.trim().length === 0) {
      this.reportError('MCP WebSocket transport URL cannot be empty', filePath);
      return;
    }

    // Basic URL validation
    try {
      if (!this.containsVariableExpansion(transport.url)) {
        const url = new URL(transport.url);
        // WebSocket URLs should use ws:// or wss://
        if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
          this.reportWarning(
            `WebSocket URL should use ws:// or wss:// protocol, found ${url.protocol}`,
            filePath
          );
        }
      }
    } catch (error) {
      this.reportError(
        `Invalid URL in WebSocket transport: ${formatError(error)}`,
        filePath
      );
    }

    // Check for variable expansion in URL
    this.validateVariableExpansion(filePath, transport.url, 'URL');
  }

  private validateEnvironmentVariables(filePath: string, env: Record<string, string>): void {
    const issues = validateEnvironmentVariables(env);
    for (const issue of issues) {
      if (issue.severity === 'warning') {
        this.reportWarning(issue.message, filePath, undefined, issue.ruleId);
      } else {
        this.reportError(issue.message, filePath, undefined, issue.ruleId);
      }
    }

    // Also validate variable expansion syntax in values
    for (const [key, value] of Object.entries(env)) {
      this.validateVariableExpansion(filePath, value, `environment variable ${key}`);
    }
  }

  private validateVariableExpansion(filePath: string, value: string, context: string): void {
    // Check for ${CLAUDE_PLUGIN_ROOT} usage
    if (value.includes('${CLAUDE_PLUGIN_ROOT}')) {
      // This is valid - it's a special variable for plugins
      return;
    }

    // Check for properly formatted variable expansion ${VAR} or ${VAR:-default}
    const expansionMatches = value.matchAll(VAR_EXPANSION_PATTERN);
    for (const match of expansionMatches) {
      const varName = match[1];
      // Variable name is already validated by the regex pattern
      if (varName.length === 0) {
        this.reportError(`Invalid variable expansion syntax in ${context}: ${match[0]}`, filePath, undefined, 'mcp-invalid-env-var');
      }
    }

    // Check for improperly formatted variables (just $VAR without braces)
    const simpleMatches = value.matchAll(SIMPLE_VAR_PATTERN);
    for (const match of simpleMatches) {
      // Skip if this is part of a properly formatted expansion
      if (!value.includes(`\${${match[1]}}`)) {
        this.reportWarning(
          `Simple variable expansion $${match[1]} in ${context}. Consider using \${${match[1]}} format.`,
          filePath
        );
      }
    }
  }

  private containsVariableExpansion(value: string): boolean {
    return VAR_EXPANSION_PATTERN.test(value) || SIMPLE_VAR_PATTERN.test(value);
  }
}

// Register validator with factory
ValidatorRegistry.register(
  {
    id: 'mcp',
    name: 'MCP Validator',
    description: 'Validates MCP (Model Context Protocol) server configuration files',
    filePatterns: ['**/.claude/mcp.json'],
    enabled: true,
  },
  (options) => new MCPValidator(options)
);
