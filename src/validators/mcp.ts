import { SchemaValidator, SchemaValidatorOptions } from './schema-validator';
import { findMcpFiles, readFileContent } from '../utils/filesystem/files';
import { z } from 'zod';
import { MCPConfigSchema } from './schemas';
import { ValidatorRegistry } from '../utils/validators/factory';

// Auto-register all rules
import '../rules';

/**
 * Options specific to MCP validator
 * Extends SchemaValidatorOptions with no additional options
 */
export type MCPValidatorOptions = SchemaValidatorOptions;

/**
 * Validates MCP (Model Context Protocol) server configuration files
 */
export class MCPValidator extends SchemaValidator<typeof MCPConfigSchema> {
  protected findConfigFiles(basePath: string): Promise<string[]> {
    return findMcpFiles(basePath);
  }

  protected getSchema(): typeof MCPConfigSchema {
    return MCPConfigSchema;
  }

  protected getNoFilesMessage(): string {
    return 'no .mcp.json';
  }

  protected async validateSemantics(
    filePath: string,
    _config: z.infer<typeof MCPConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Normalize flat format to wrapped format for rules
    // Rules always expect { "mcpServers": { ... } } format
    const normalizedContent = this.normalizeContent(content);

    // Execute ALL MCP rules via category-based discovery
    // All validation logic is in rule files under src/rules/mcp/
    await this.executeRulesForCategory('MCP', filePath, normalizedContent);
  }

  /**
   * Normalize MCP config content to wrapped format
   * Flat format: { "serverName": { ... } }
   * Wrapped format: { "mcpServers": { "serverName": { ... } } }
   */
  private normalizeContent(content: string): string {
    try {
      const parsed: unknown = JSON.parse(content);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        !('mcpServers' in parsed)
      ) {
        // Flat format - wrap for rules
        return JSON.stringify({ mcpServers: parsed });
      }
      return content;
    } catch {
      return content;
    }
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
