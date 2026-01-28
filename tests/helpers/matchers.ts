/**
 * Custom Jest matchers for validator testing
 * Provides expressive assertions for validation results
 */

import { ValidationResult } from '../../src/validators/base';

/**
 * Custom matcher to check if validation passed
 */
function toPassValidation(received: ValidationResult) {
  const pass = received.valid && received.errors.length === 0;

  const message = pass
    ? () =>
        `expected validation to fail but it passed\n\n` +
        `Received:\n` +
        `  valid: ${received.valid}\n` +
        `  errors: ${received.errors.length}\n` +
        `  warnings: ${received.warnings.length}`
    : () =>
        `expected validation to pass but it failed\n\n` +
        `Errors:\n` +
        received.errors.map((e) => `  - ${e.message}`).join('\n') +
        (received.warnings.length > 0
          ? `\n\nWarnings:\n` + received.warnings.map((w) => `  - ${w.message}`).join('\n')
          : '');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check if validation failed
 */
function toFailValidation(received: ValidationResult) {
  const pass = !received.valid || received.errors.length > 0;

  const message = pass
    ? () =>
        `expected validation to pass but it failed\n\n` +
        `Errors:\n` +
        received.errors.map((e) => `  - ${e.message}`).join('\n')
    : () => `expected validation to fail but it passed`;

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check for a specific error message
 */
function toHaveError(received: ValidationResult, expectedMessage: string | RegExp) {
  const hasError =
    typeof expectedMessage === 'string'
      ? received.errors.some((e) => e.message.includes(expectedMessage))
      : received.errors.some((e) => expectedMessage.test(e.message));

  const pass = hasError;

  const message = pass
    ? () =>
        `expected validation NOT to have error matching "${expectedMessage}"\n\n` +
        `But found errors:\n` +
        received.errors.map((e) => `  - ${e.message}`).join('\n')
    : () =>
        `expected validation to have error matching "${expectedMessage}"\n\n` +
        `Actual errors:\n` +
        (received.errors.length > 0
          ? received.errors.map((e) => `  - ${e.message}`).join('\n')
          : '  (no errors)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check for a specific warning message
 */
function toHaveWarning(received: ValidationResult, expectedMessage: string | RegExp) {
  const hasWarning =
    typeof expectedMessage === 'string'
      ? received.warnings.some((w) => w.message.includes(expectedMessage))
      : received.warnings.some((w) => expectedMessage.test(w.message));

  const pass = hasWarning;

  const message = pass
    ? () =>
        `expected validation NOT to have warning matching "${expectedMessage}"\n\n` +
        `But found warnings:\n` +
        received.warnings.map((w) => `  - ${w.message}`).join('\n')
    : () =>
        `expected validation to have warning matching "${expectedMessage}"\n\n` +
        `Actual warnings:\n` +
        (received.warnings.length > 0
          ? received.warnings.map((w) => `  - ${w.message}`).join('\n')
          : '  (no warnings)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check the number of errors
 */
function toHaveErrorCount(received: ValidationResult, expectedCount: number) {
  const actualCount = received.errors.length;
  const pass = actualCount === expectedCount;

  const message = pass
    ? () =>
        `expected validation NOT to have ${expectedCount} error(s)\n\n` +
        `But it did:\n` +
        received.errors.map((e) => `  - ${e.message}`).join('\n')
    : () =>
        `expected validation to have ${expectedCount} error(s) but got ${actualCount}\n\n` +
        (actualCount > 0
          ? `Actual errors:\n` + received.errors.map((e) => `  - ${e.message}`).join('\n')
          : '  (no errors)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check the number of warnings
 */
function toHaveWarningCount(received: ValidationResult, expectedCount: number) {
  const actualCount = received.warnings.length;
  const pass = actualCount === expectedCount;

  const message = pass
    ? () =>
        `expected validation NOT to have ${expectedCount} warning(s)\n\n` +
        `But it did:\n` +
        received.warnings.map((w) => `  - ${w.message}`).join('\n')
    : () =>
        `expected validation to have ${expectedCount} warning(s) but got ${actualCount}\n\n` +
        (actualCount > 0
          ? `Actual warnings:\n` + received.warnings.map((w) => `  - ${w.message}`).join('\n')
          : '  (no warnings)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check for specific error with rule ID
 */
function toHaveErrorWithRule(
  received: ValidationResult,
  expectedMessage: string | RegExp,
  expectedRuleId: string
) {
  const hasError =
    typeof expectedMessage === 'string'
      ? received.errors.some(
          (e) => e.message.includes(expectedMessage) && e.ruleId === expectedRuleId
        )
      : received.errors.some(
          (e) => expectedMessage.test(e.message) && e.ruleId === expectedRuleId
        );

  const pass = hasError;

  const message = pass
    ? () =>
        `expected validation NOT to have error with message "${expectedMessage}" and rule "${expectedRuleId}"\n\n` +
        `But found errors:\n` +
        received.errors.map((e) => `  - [${e.ruleId}] ${e.message}`).join('\n')
    : () =>
        `expected validation to have error with message "${expectedMessage}" and rule "${expectedRuleId}"\n\n` +
        `Actual errors:\n` +
        (received.errors.length > 0
          ? received.errors.map((e) => `  - [${e.ruleId}] ${e.message}`).join('\n')
          : '  (no errors)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check for errors in a specific file
 */
function toHaveErrorInFile(received: ValidationResult, filePath: string) {
  const hasErrorInFile = received.errors.some((e) => e.file === filePath);

  const pass = hasErrorInFile;

  const message = pass
    ? () =>
        `expected validation NOT to have errors in file "${filePath}"\n\n` +
        `But found errors:\n` +
        received.errors.filter((e) => e.file === filePath).map((e) => `  - ${e.message}`).join('\n')
    : () =>
        `expected validation to have errors in file "${filePath}"\n\n` +
        `Errors found in other files:\n` +
        (received.errors.length > 0
          ? received.errors.map((e) => `  - [${e.file}] ${e.message}`).join('\n')
          : '  (no errors)');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check that validation has no errors
 */
function toHaveNoErrors(received: ValidationResult) {
  const pass = received.errors.length === 0;

  const message = pass
    ? () => `expected validation to have errors but it had none`
    : () =>
        `expected validation to have no errors\n\n` +
        `Found ${received.errors.length} error(s):\n` +
        received.errors.map((e) => `  - ${e.message}`).join('\n');

  return {
    pass,
    message,
  };
}

/**
 * Custom matcher to check that validation has no warnings
 */
function toHaveNoWarnings(received: ValidationResult) {
  const pass = received.warnings.length === 0;

  const message = pass
    ? () => `expected validation to have warnings but it had none`
    : () =>
        `expected validation to have no warnings\n\n` +
        `Found ${received.warnings.length} warning(s):\n` +
        received.warnings.map((w) => `  - ${w.message}`).join('\n');

  return {
    pass,
    message,
  };
}

// Export all matchers
export const matchers = {
  toPassValidation,
  toFailValidation,
  toHaveError,
  toHaveWarning,
  toHaveErrorCount,
  toHaveWarningCount,
  toHaveErrorWithRule,
  toHaveErrorInFile,
  toHaveNoErrors,
  toHaveNoWarnings,
};

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * Check if validation passed (valid === true && no errors)
       */
      toPassValidation(): R;

      /**
       * Check if validation failed (valid === false || has errors)
       */
      toFailValidation(): R;

      /**
       * Check if validation has an error matching the message
       */
      toHaveError(message: string | RegExp): R;

      /**
       * Check if validation has a warning matching the message
       */
      toHaveWarning(message: string | RegExp): R;

      /**
       * Check if validation has exactly N errors
       */
      toHaveErrorCount(count: number): R;

      /**
       * Check if validation has exactly N warnings
       */
      toHaveWarningCount(count: number): R;

      /**
       * Check if validation has an error with specific message and rule ID
       */
      toHaveErrorWithRule(message: string | RegExp, ruleId: string): R;

      /**
       * Check if validation has errors in a specific file
       */
      toHaveErrorInFile(filePath: string): R;

      /**
       * Check if validation has no errors
       */
      toHaveNoErrors(): R;

      /**
       * Check if validation has no warnings
       */
      toHaveNoWarnings(): R;
    }
  }
}
