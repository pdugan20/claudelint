import { JSONConfigValidator, JSONConfigValidatorOptions } from './json-config-validator';
import { findMcpFiles, readFileContent } from '../utils/file-system';
import { z } from 'zod';
import {
  MCPConfigSchema,
  MCPStdioTransportSchema,
  MCPSSETransportSchema,
  MCPHTTPTransportSchema,
  MCPWebSocketTransportSchema,
} from './schemas';
import { ValidatorRegistry } from '../utils/validator-factory';
import { validateEnvironmentVariables, formatError } from '../utils/validation-helpers';

// Auto-register all rules
import '../rules';

// Import new-style rules
import { rule as mcpInvalidServerRule } from '../rules/mcp/mcp-invalid-server';
import { rule as mcpInvalidTransportRule } from '../rules/mcp/mcp-invalid-transport';
import { rule as mcpInvalidEnvVarRule } from '../rules/mcp/mcp-invalid-env-var';

/**
 * Options specific to MCP validator
 * Extends JSONConfigValidatorOptions with no additional options
 */
export type MCPValidatorOptions = JSONConfigValidatorOptions;

/**
 * Validates MCP (Model Context Protocol) server configuration files
 */
export class MCPValidator extends JSONConfigValidator<typeof MCPConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findMcpFiles(basePath);
  }

  protected getSchema(): typeof MCPConfigSchema {
    return MCPConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'No .mcp.json files found';
  }

  protected async validateConfig(
    filePath: string,
    config: z.infer<typeof MCPConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // NEW: Execute new-style rules for registered rule IDs
    await this.executeRule(mcpInvalidServerRule, filePath, content);
    await this.executeRule(mcpInvalidTransportRule, filePath, content);
    await this.executeRule(mcpInvalidEnvVarRule, filePath, content);

    // OLD: Keep additional validation not covered by registered rules
    // Validate each MCP server
    for (const [serverKey, server] of Object.entries(config.mcpServers)) {
      // Check server key matches name (warning, no specific ruleId)
      if (server.name !== serverKey) {
        this.reportWarning(
          `Server key "${serverKey}" does not match server name "${server.name}"`,
          filePath
        );
      }

      // Validate transport (additional checks beyond transport type)
      this.validateTransportDetails(filePath, server.transport);
    }
  }

  private validateTransportDetails(
    filePath: string,
    transport:
      | z.infer<typeof MCPStdioTransportSchema>
      | z.infer<typeof MCPSSETransportSchema>
      | z.infer<typeof MCPHTTPTransportSchema>
      | z.infer<typeof MCPWebSocketTransportSchema>
  ): void {
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
  }

  private containsVariableExpansion(value: string): boolean {
    // Simple check for variable patterns
    return value.includes('${') || value.includes('$');
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
