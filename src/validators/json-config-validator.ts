/**
 * Base class for validators that validate JSON configuration files
 * Handles common pattern of finding, parsing, and validating JSON against Zod schemas
 */

import { BaseValidator, ValidationResult } from './base';
import { fileExists } from '../utils/file-system';
import { z } from 'zod';

/**
 * Abstract base class for JSON configuration validators
 * Subclasses must implement:
 * - findConfigFiles(): Find relevant config files in the project
 * - getSchema(): Return the Zod schema for validation
 * - validateConfig(): Perform additional validation beyond schema
 */
export abstract class JSONConfigValidator<T extends z.ZodType> extends BaseValidator {
  protected basePath: string;

  constructor(options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean } = {}) {
    super(options);
    this.basePath = options.path || process.cwd();
  }

  async validate(): Promise<ValidationResult> {
    const files = await this.findFiles();

    if (files.length === 0) {
      this.reportWarning(this.getNoFilesMessage());
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
        this.reportError(`File not found: ${this.options.path}`);
        return [];
      }
      return [this.options.path];
    }

    return this.findConfigFiles(this.basePath);
  }

  /**
   * Validate a single JSON configuration file
   * Reads, parses, validates against schema, then runs custom validation
   */
  private async validateFile(filePath: string): Promise<void> {
    // Read and parse JSON
    const config = await this.readAndParseJSON(filePath);
    if (!config) {
      return;
    }

    // Validate against schema
    try {
      const schema = this.getSchema();
      const result = schema.safeParse(config);

      if (!result.success) {
        for (const issue of result.error.issues) {
          this.reportError(`${issue.path.join('.')}: ${issue.message}`, filePath);
        }
        return;
      }

      // Run additional custom validation
      // Type assertion is safe here because we've validated with safeParse above
      await this.validateConfig(filePath, result.data as z.infer<T>);
    } catch (error) {
      this.reportError(
        `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
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
  protected abstract validateConfig(filePath: string, config: z.infer<T>): Promise<void>;

  /**
   * Get the warning message to display when no config files are found
   * Can be overridden by subclasses
   */
  protected getNoFilesMessage(): string {
    return 'No configuration files found';
  }
}
