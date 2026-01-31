/**
 * Factory for creating and managing validator instances
 * Provides centralized validator registration and discovery
 */

import { BaseValidator, BaseValidatorOptions } from '../../validators/base';

/**
 * Metadata describing a validator
 */
export interface ValidatorMetadata {
  /** Unique identifier for the validator */
  id: string;
  /** Human-readable name */
  name: string;
  /** Brief description of what this validator checks */
  description: string;
  /** File patterns this validator applies to */
  filePatterns: string[];
  /** Whether this validator is enabled by default */
  enabled: boolean;
}

/**
 * Factory function that creates a validator instance
 */
export type ValidatorFactory = (options?: BaseValidatorOptions) => BaseValidator;

/**
 * Validator registration entry
 */
interface ValidatorRegistration {
  metadata: ValidatorMetadata;
  factory: ValidatorFactory;
}

/**
 * Centralized validator factory and registry
 * Manages all available validators in the system
 */
export class ValidatorRegistry {
  private static validators = new Map<string, ValidatorRegistration>();

  /**
   * Register a validator with the registry
   *
   * @param metadata - Validator metadata
   * @param factory - Factory function to create validator instances
   */
  static register(metadata: ValidatorMetadata, factory: ValidatorFactory): void {
    if (this.validators.has(metadata.id)) {
      throw new Error(`Validator with id "${metadata.id}" is already registered`);
    }
    this.validators.set(metadata.id, { metadata, factory });
  }

  /**
   * Create a validator instance by ID
   *
   * @param id - Validator ID
   * @param options - Options to pass to the validator
   * @returns Validator instance
   * @throws Error if validator ID is not found
   */
  static create(id: string, options?: BaseValidatorOptions): BaseValidator {
    const registration = this.validators.get(id);
    if (!registration) {
      throw new Error(`Validator with id "${id}" is not registered`);
    }
    return registration.factory(options);
  }

  /**
   * Get all registered validators
   *
   * @returns Array of validator instances
   */
  static getAll(options?: BaseValidatorOptions): BaseValidator[] {
    return Array.from(this.validators.values()).map((reg) => reg.factory(options));
  }

  /**
   * Get only enabled validators
   *
   * @returns Array of enabled validator instances
   */
  static getEnabled(options?: BaseValidatorOptions): BaseValidator[] {
    return Array.from(this.validators.values())
      .filter((reg) => reg.metadata.enabled)
      .map((reg) => reg.factory(options));
  }

  /**
   * Get validator metadata by ID
   *
   * @param id - Validator ID
   * @returns Validator metadata or undefined if not found
   */
  static getMetadata(id: string): ValidatorMetadata | undefined {
    return this.validators.get(id)?.metadata;
  }

  /**
   * Get all validator metadata
   *
   * @returns Array of all validator metadata
   */
  static getAllMetadata(): ValidatorMetadata[] {
    return Array.from(this.validators.values()).map((reg) => reg.metadata);
  }

  /**
   * Check if a validator is registered
   *
   * @param id - Validator ID
   * @returns True if validator is registered
   */
  static has(id: string): boolean {
    return this.validators.has(id);
  }

  /**
   * Get count of registered validators
   *
   * @returns Number of registered validators
   */
  static count(): number {
    return this.validators.size;
  }

  /**
   * Clear all registered validators (mainly for testing)
   */
  static clear(): void {
    this.validators.clear();
  }
}
