/**
 * Base class for validators that validate JSON configuration files
 * Handles common pattern of finding, parsing, and validating JSON against Zod schemas
 */

import { BaseValidator, ValidationResult, BaseValidatorOptions } from './base';
import { fileExists } from '../utils/filesystem/files';
import { z } from 'zod';
import { ValidationContext } from '../composition/types';
import { readJSON, zodSchema } from '../composition/json-validators';

/**
 * Options for JSON configuration validators
 * Same as BaseValidatorOptions with no additional options
 */
export type JSONConfigValidatorOptions = BaseValidatorOptions;

/**
 * Abstract base class for JSON configuration validators
 * Subclasses must implement:
 * - findConfigFiles(): Find relevant config files in the project
 * - getSchema(): Return the Zod schema for validation
 * - validateConfig(): Perform additional validation beyond schema
 */
export abstract class JSONConfigValidator<T extends z.ZodType> extends BaseValidator {
  protected basePath: string;

  constructor(options: JSONConfigValidatorOptions = {}) {
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
   * Uses composition framework to read, parse, and validate against schema
   */
  private async validateFile(filePath: string): Promise<void> {
    // Create validation context
    const context: ValidationContext = {
      filePath,
      options: this.options,
      state: new Map(),
    };

    // Step 1: Read and parse JSON
    const readValidator = readJSON<z.infer<T>>();
    const readResult = await readValidator(filePath, context);

    // Merge read errors/warnings into validator result
    this.mergeSchemaValidationResult(readResult);

    if (!readResult.valid) {
      return;
    }

    // Step 2: Validate against schema
    const schemaValidator = zodSchema(this.getSchema());
    const schemaResult = await schemaValidator(null, context);

    // Merge schema validation errors/warnings into validator result
    this.mergeSchemaValidationResult(schemaResult);

    // If validation passed, run custom validation
    if (schemaResult.valid) {
      const config = context.state?.get('validatedData') as z.infer<T>;
      if (config) {
        await this.validateConfig(filePath, config);
      }
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
