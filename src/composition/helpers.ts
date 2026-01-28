/**
 * Helper functions for building validation results
 */

import { ValidationError, ValidationWarning } from '../validators/base';
import { ComposableValidationResult, ValidationContext, IssueOptions } from './types';

/**
 * Creates a successful validation result
 */
export function success(): ComposableValidationResult {
  return {
    valid: true,
    errors: [],
    warnings: [],
  };
}

/**
 * Creates a validation result with an error
 */
export function error(
  message: string,
  context?: Partial<ValidationContext>,
  options?: IssueOptions
): ComposableValidationResult {
  const err: ValidationError = {
    message,
    file: context?.filePath,
    line: context?.line,
    severity: 'error',
    ruleId: options?.ruleId,
    fix: options?.fix,
    explanation: options?.explanation,
    howToFix: options?.howToFix,
  };

  return {
    valid: false,
    errors: [err],
    warnings: [],
  };
}

/**
 * Creates a validation result with a warning
 */
export function warning(
  message: string,
  context?: Partial<ValidationContext>,
  options?: IssueOptions
): ComposableValidationResult {
  const warn: ValidationWarning = {
    message,
    file: context?.filePath,
    line: context?.line,
    severity: 'warning',
    ruleId: options?.ruleId,
    fix: options?.fix,
    explanation: options?.explanation,
    howToFix: options?.howToFix,
  };

  return {
    valid: true,
    errors: [],
    warnings: [warn],
  };
}

/**
 * Merges multiple validation results into one
 */
export function mergeResults(results: ComposableValidationResult[]): ComposableValidationResult {
  const merged: ComposableValidationResult = {
    valid: results.every((r) => r.valid),
    errors: [],
    warnings: [],
  };

  for (const result of results) {
    merged.errors.push(...result.errors);
    merged.warnings.push(...result.warnings);
  }

  return merged;
}

/**
 * Combines a context with partial overrides
 */
export function withContext(
  base: ValidationContext,
  overrides: Partial<ValidationContext>
): ValidationContext {
  return {
    ...base,
    ...overrides,
    state: overrides.state || base.state,
    options: overrides.options || base.options,
  };
}
