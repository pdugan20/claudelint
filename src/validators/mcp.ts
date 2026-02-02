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
    return 'No .mcp.json files found';
  }

  protected async validateSemantics(
    filePath: string,
    _config: z.infer<typeof MCPConfigSchema>
  ): Promise<void> {
    // Read file content for rule execution
    const content = await readFileContent(filePath);

    // Execute ALL MCP rules via category-based discovery
    // All validation logic is in rule files under src/rules/mcp/
    await this.executeRulesForCategory('MCP', filePath, content);
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
