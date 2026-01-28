/**
 * Type definitions for the validation composition framework
 */

import { ValidationError, ValidationWarning, BaseValidatorOptions } from '../validators/base';
import { RuleId } from '../rules/rule-ids';

/**
 * Context passed to composable validators
 */
export interface ValidationContext {
  /** File path being validated */
  filePath?: string;
  /** Line number being validated */
  line?: number;
  /** Validator options */
  options: BaseValidatorOptions;
  /** Shared state for cross-validator communication */
  state?: Map<string, unknown>;
}

/**
 * Result from a composable validator
 */
export interface ComposableValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors found */
  errors: ValidationError[];
  /** Validation warnings found */
  warnings: ValidationWarning[];
}

/**
 * A composable validator function
 * Takes a value and context, returns validation results
 */
export type ComposableValidator<T> = (
  value: T,
  context: ValidationContext
) => Promise<ComposableValidationResult> | ComposableValidationResult;

/**
 * Options for creating validation errors/warnings
 */
export interface IssueOptions {
  /** Rule ID that triggered this issue */
  ruleId?: RuleId;
  /** Quick fix suggestion */
  fix?: string;
  /** Detailed explanation */
  explanation?: string;
  /** How to fix instructions */
  howToFix?: string;
}
