/**
 * Base class for validators that validate JSON configuration files
 * Handles common pattern of finding, parsing, and validating JSON against Zod schemas
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
 * Subclasses must implement:
 * - findConfigFiles(): Find relevant config files in the project
 * - getSchema(): Return the Zod schema for validation
 * - validateSemantics(): Perform additional validation beyond schema
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
   * Must be implemented by subclasses
   */
  protected abstract findConfigFiles(basePath: string): Promise<string[]>;

  /**
   * Get the Zod schema for validating this configuration type
   * Must be implemented by subclasses
   */
  protected abstract getSchema(): T;

  /**
   * Perform additional validation beyond schema validation
   * Must be implemented by subclasses
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
