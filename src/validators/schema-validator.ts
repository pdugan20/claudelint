/**
 * Base validator class for JSON configuration file validation
 *
 * SchemaValidator extends FileValidator to provide specialized handling for
 * JSON configuration files. It combines Zod schema validation with custom
 * semantic validation and rule execution. Used for validating:
 * - MCP server configs (mcp.json)
 * - Settings files (settings.json)
 * - Hook configurations (hooks.json)
 * - Plugin manifests (plugin.json)
 * - LSP configurations (lsp.json)
 *
 * ## When to Use
 *
 * Extend SchemaValidator when validating:
 * - JSON configuration files
 * - Files that require Zod schema validation
 * - Files where structure validation is the primary concern
 *
 * Use FileValidator instead for text/markdown files.
 *
 * ## Architecture
 *
 * SchemaValidator provides a 4-step validation process:
 * 1. **Read** - Load file content
 * 2. **Parse** - Parse JSON and report syntax errors
 * 3. **Schema Validation** - Validate against Zod schema and report structure errors
 * 4. **Semantic Validation** - Run custom validators and category-based rules
 *
 * Subclasses implement three abstract methods to customize behavior:
 * - `findConfigFiles()` - Discover config files in the project
 * - `getSchema()` - Return the Zod schema for structure validation
 * - `validateSemantics()` - Perform additional validation and execute rules
 *
 * ## Validation Layers
 *
 * SchemaValidator provides two-layer validation:
 *
 * **Layer 1: Schema (Structure)**
 * - Validates JSON structure against Zod schema
 * - Checks required fields, types, formats
 * - Reports schema violations as errors
 * - Non-configurable (always runs)
 *
 * **Layer 2: Semantics (Business Logic)**
 * - Executes category-based rules via `executeRulesForCategory()`
 * - Validates references, relationships, best practices
 * - Respects config for rule enabling/disabling
 * - Configurable via .claudelintrc.json
 *
 * ## Examples
 *
 * Validators extending SchemaValidator:
 * - MCPValidator - Validates MCP server configurations
 * - SettingsValidator - Validates Claude Code settings
 * - HooksValidator - Validates hook configurations
 * - PluginValidator - Validates plugin manifests
 * - LSPValidator - Validates LSP configurations
 *
 * @example
 * ```typescript
 * class MyConfigValidator extends SchemaValidator<typeof MyConfigSchema> {
 *   protected findConfigFiles(basePath: string): Promise<string[]> {
 *     return findMyConfigFiles(basePath);
 *   }
 *
 *   protected getSchema(): typeof MyConfigSchema {
 *     return MyConfigSchema;
 *   }
 *
 *   protected async validateSemantics(
 *     filePath: string,
 *     config: z.infer<typeof MyConfigSchema>
 *   ): Promise<void> {
 *     const content = await readFileContent(filePath);
 *
 *     // Execute all rules for this category
 *     await this.executeRulesForCategory('MyConfig', filePath, content);
 *
 *     // Custom validation logic
 *     if (config.someField) {
 *       this.report('Custom validation message', filePath, undefined, 'my-rule');
 *     }
 *   }
 * }
 * ```
 *
 * @see FileValidator for text/markdown file validation
 */

import { FileValidator, ValidationResult, BaseValidatorOptions } from './file-validator';
import { fileExists } from '../utils/filesystem/files';
import { z } from 'zod';
import { promises as fs } from 'fs';

/**
 * Options for schema-based validators
 * Same as BaseValidatorOptions with no additional options
 */
export type SchemaValidatorOptions = BaseValidatorOptions;

/**
 * Abstract base class for JSON configuration validators
 *
 * Subclasses must implement three methods:
 * - `findConfigFiles()` - Find relevant config files in the project
 * - `getSchema()` - Return the Zod schema for validation
 * - `validateSemantics()` - Perform additional validation beyond schema
 */
export abstract class SchemaValidator<T extends z.ZodType> extends FileValidator {
  protected basePath: string;

  constructor(options: SchemaValidatorOptions = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    if (files.length === 0) {
      return this.getResult();
    }

    for (const file of files) {
      await this.validateFile(file);
    }

    return this.getResult();
  }

  /**
   * Find configuration files to validate
   * If specific path provided via options, validates just that file
   * Otherwise finds all relevant config files in basePath
   */
  private async findFiles(): Promise<string[]> {
    if (this.options.path) {
      const exists = await fileExists(this.options.path);
      if (!exists) {
        throw new Error(`File not found: ${this.options.path}`);
      }
      return [this.options.path];
    }

    return this.findConfigFiles(this.basePath);
  }

  /**
   * Validate a single JSON configuration file
   *
   * Process:
   * 1. Read file content
   * 2. Parse JSON (report syntax errors)
   * 3. Validate against Zod schema (report structure errors)
   * 4. Run custom semantic validation
   *
   * @param filePath - Path to the JSON file to validate
   */
  private async validateFile(filePath: string): Promise<void> {
    try {
      // Step 1: Read file
      const content = await fs.readFile(filePath, 'utf-8');

      // Step 2: Parse JSON
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : String(parseError);
        this.report(`Invalid JSON syntax: ${message}`, filePath);
        return;
      }

      // Step 3: Validate against Zod schema
      const schema = this.getSchema();
      const result = schema.safeParse(parsed);

      if (!result.success) {
        // Report all schema validation errors
        result.error.issues.forEach((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
          this.report(`${path}${issue.message}`, filePath);
        });
        return;
      }

      // Step 4: Run custom semantic validation
      // This receives the parsed, validated config object
      await this.validateSemantics(filePath, result.data as z.TypeOf<T>);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.report(`Error validating file: ${message}`, filePath);
    }
  }

  /**
   * Find all configuration files in the given base path
   *
   * Subclasses implement this to discover config files using filesystem utilities.
   * Return an array of absolute file paths to validate.
   *
   * @param basePath - Root directory to search for config files
   * @returns Promise resolving to array of file paths
   *
   * @example
   * ```typescript
   * protected findConfigFiles(basePath: string): Promise<string[]> {
   *   return findMcpFiles(basePath); // Uses filesystem utility
   * }
   * ```
   */
  protected abstract findConfigFiles(basePath: string): Promise<string[]>;

  /**
   * Get the Zod schema for validating this configuration type
   *
   * Subclasses return their specific Zod schema. The schema defines the
   * structure, required fields, types, and formats for the JSON config.
   *
   * @returns Zod schema for this config type
   *
   * @example
   * ```typescript
   * protected getSchema(): typeof MCPConfigSchema {
   *   return MCPConfigSchema;
   * }
   * ```
   */
  protected abstract getSchema(): T;

  /**
   * Perform semantic validation beyond schema structure validation
   *
   * This method receives a pre-validated config object (already passed schema validation)
   * and performs additional business logic validation. Typical tasks:
   * - Execute category-based rules via `executeRulesForCategory()`
   * - Validate references and relationships
   * - Check file existence for referenced paths
   * - Validate environment variables
   * - Apply custom business rules
   *
   * @param filePath - Path to the config file being validated
   * @param config - Parsed and schema-validated configuration object
   *
   * @example
   * ```typescript
   * protected async validateSemantics(
   *   filePath: string,
   *   config: z.infer<typeof MCPConfigSchema>
   * ): Promise<void> {
   *   const content = await readFileContent(filePath);
   *
   *   // Execute all registered rules for this category
   *   await this.executeRulesForCategory('MCP', filePath, content);
   *
   *   // Additional custom validation
   *   for (const [key, server] of Object.entries(config.mcpServers)) {
   *     if (server.command && !existsSync(server.command)) {
   *       this.report(\`Command not found: \${server.command}\`, filePath, undefined, 'mcp-command-missing');
   *     }
   *   }
   * }
   * ```
   */
  protected abstract validateSemantics(filePath: string, config: z.infer<T>): Promise<void>;

  /**
   * Get the warning message to display when no config files are found
   * Can be overridden by subclasses
   */
  protected getNoFilesMessage(): string {
    return 'No configuration files found';
  }
}
