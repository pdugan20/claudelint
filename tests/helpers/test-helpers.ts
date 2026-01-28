/**
 * Helper functions for common validator test patterns
 */

import { BaseValidator, ValidationResult } from '../../src/validators/base';

/**
 * Run a validator and return the result
 * Convenience wrapper for common test pattern
 */
export async function runValidator(validator: BaseValidator): Promise<ValidationResult> {
  return validator.validate();
}

/**
 * Expect validation to pass with no errors
 */
export async function expectValidationToPass(validator: BaseValidator): Promise<ValidationResult> {
  const result = await validator.validate();
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
  return result;
}

/**
 * Expect validation to fail with errors
 */
export async function expectValidationToFail(validator: BaseValidator): Promise<ValidationResult> {
  const result = await validator.validate();
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  return result;
}

/**
 * Expect validation to have specific error
 */
export async function expectValidationToHaveError(
  validator: BaseValidator,
  errorMessage: string | RegExp
): Promise<ValidationResult> {
  const result = await validator.validate();

  const hasError =
    typeof errorMessage === 'string'
      ? result.errors.some((e) => e.message.includes(errorMessage))
      : result.errors.some((e) => errorMessage.test(e.message));

  expect(hasError).toBe(true);
  return result;
}

/**
 * Expect validation to have specific warning
 */
export async function expectValidationToHaveWarning(
  validator: BaseValidator,
  warningMessage: string | RegExp
): Promise<ValidationResult> {
  const result = await validator.validate();

  const hasWarning =
    typeof warningMessage === 'string'
      ? result.warnings.some((w) => w.message.includes(warningMessage))
      : result.warnings.some((w) => warningMessage.test(w.message));

  expect(hasWarning).toBe(true);
  return result;
}

/**
 * Expect validation to have exact number of errors
 */
export async function expectErrorCount(
  validator: BaseValidator,
  count: number
): Promise<ValidationResult> {
  const result = await validator.validate();
  expect(result.errors).toHaveLength(count);
  return result;
}

/**
 * Expect validation to have exact number of warnings
 */
export async function expectWarningCount(
  validator: BaseValidator,
  count: number
): Promise<ValidationResult> {
  const result = await validator.validate();
  expect(result.warnings).toHaveLength(count);
  return result;
}

/**
 * Extract all error messages from a validation result
 */
export function getErrorMessages(result: ValidationResult): string[] {
  return result.errors.map((e) => e.message);
}

/**
 * Extract all warning messages from a validation result
 */
export function getWarningMessages(result: ValidationResult): string[] {
  return result.warnings.map((w) => w.message);
}

/**
 * Check if result contains a specific error message
 */
export function hasError(result: ValidationResult, message: string | RegExp): boolean {
  return typeof message === 'string'
    ? result.errors.some((e) => e.message.includes(message))
    : result.errors.some((e) => message.test(e.message));
}

/**
 * Check if result contains a specific warning message
 */
export function hasWarning(result: ValidationResult, message: string | RegExp): boolean {
  return typeof message === 'string'
    ? result.warnings.some((w) => w.message.includes(message))
    : result.warnings.some((w) => message.test(w.message));
}

/**
 * Get errors for a specific file
 */
export function getErrorsForFile(result: ValidationResult, filePath: string) {
  return result.errors.filter((e) => e.file === filePath);
}

/**
 * Get warnings for a specific file
 */
export function getWarningsForFile(result: ValidationResult, filePath: string) {
  return result.warnings.filter((w) => w.file === filePath);
}

/**
 * Get errors with a specific rule ID
 */
export function getErrorsWithRule(result: ValidationResult, ruleId: string) {
  return result.errors.filter((e) => e.ruleId === ruleId);
}

/**
 * Get warnings with a specific rule ID
 */
export function getWarningsWithRule(result: ValidationResult, ruleId: string) {
  return result.warnings.filter((w) => w.ruleId === ruleId);
}

/**
 * Assert that all errors have a rule ID
 */
export function assertAllErrorsHaveRuleId(result: ValidationResult): void {
  const errorsWithoutRuleId = result.errors.filter((e) => !e.ruleId);

  if (errorsWithoutRuleId.length > 0) {
    throw new Error(
      `Found ${errorsWithoutRuleId.length} error(s) without rule ID:\n` +
        errorsWithoutRuleId.map((e) => `  - ${e.message}`).join('\n')
    );
  }
}

/**
 * Assert that all warnings have a rule ID
 */
export function assertAllWarningsHaveRuleId(result: ValidationResult): void {
  const warningsWithoutRuleId = result.warnings.filter((w) => !w.ruleId);

  if (warningsWithoutRuleId.length > 0) {
    throw new Error(
      `Found ${warningsWithoutRuleId.length} warning(s) without rule ID:\n` +
        warningsWithoutRuleId.map((w) => `  - ${w.message}`).join('\n')
    );
  }
}

/**
 * Create a mock validation result for testing
 */
export function createMockResult(
  options: {
    valid?: boolean;
    errors?: Array<{ message: string; file?: string; line?: number; ruleId?: string }>;
    warnings?: Array<{ message: string; file?: string; line?: number; ruleId?: string }>;
  } = {}
): ValidationResult {
  return {
    valid: options.valid ?? true,
    errors: (options.errors || []).map((e) => ({
      message: e.message,
      file: e.file,
      line: e.line,
      severity: 'error' as const,
      ruleId: e.ruleId as any,
    })),
    warnings: (options.warnings || []).map((w) => ({
      message: w.message,
      file: w.file,
      line: w.line,
      severity: 'warning' as const,
      ruleId: w.ruleId as any,
    })),
  };
}
