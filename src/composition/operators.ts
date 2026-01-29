/**
 * Composition operators for combining validators
 */

import { ComposableValidator, ValidationContext } from './types';
import { success, mergeResults } from './helpers';
import { ValidationError, ValidationWarning } from '../validators/base';

/**
 * Chains validators in sequence, stopping at first error
 * All validators must pass for the composition to pass
 *
 * @example
 * const validateName = compose(
 *   required(),
 *   minLength(3),
 *   maxLength(64)
 * );
 */
export function compose<T>(
  ...validators: ComposableValidator<T>[]
): ComposableValidator<T> {
  return async (value: T, context: ValidationContext) => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const validator of validators) {
      const result = await validator(value, context);

      // Accumulate warnings
      warnings.push(...result.warnings);

      // Stop at first error
      if (!result.valid) {
        errors.push(...result.errors);
        return {
          valid: false,
          errors,
          warnings,
        };
      }
    }

    return {
      valid: true,
      errors,
      warnings,
    };
  };
}

/**
 * Makes a validator optional (skip if value is null/undefined)
 *
 * @example
 * const validateOptionalEmail = optional(
 *   regex(/^.+@.+\..+$/, 'Invalid email')
 * );
 */
export function optional<T>(
  validator: ComposableValidator<T>
): ComposableValidator<T | null | undefined> {
  return async (value: T | null | undefined, context: ValidationContext) => {
    if (value == null) {
      return success();
    }
    return validator(value, context);
  };
}

/**
 * Conditionally applies validator based on predicate
 *
 * @example
 * const validateIfProduction = conditional(
 *   (_, ctx) => ctx.options.config?.env === 'production',
 *   minLength(10)
 * );
 */
export function conditional<T>(
  predicate: (value: T, context: ValidationContext) => boolean,
  validator: ComposableValidator<T>
): ComposableValidator<T> {
  return async (value: T, context: ValidationContext) => {
    if (predicate(value, context)) {
      return validator(value, context);
    }
    return success();
  };
}

/**
 * All validators must pass (accumulates all errors and warnings)
 *
 * @example
 * const validateConfig = all(
 *   hasRequiredFields(['name', 'version']),
 *   hasValidVersion,
 *   hasValidDependencies
 * );
 */
export function all<T>(...validators: ComposableValidator<T>[]): ComposableValidator<T> {
  return async (value: T, context: ValidationContext) => {
    const results = await Promise.all(validators.map((v) => v(value, context)));
    return mergeResults(results);
  };
}

/**
 * At least one validator must pass
 * Returns success if any validator passes, otherwise returns all errors
 *
 * @example
 * const validatePathType = any(
 *   fileExists,
 *   directoryExists
 * );
 */
export function any<T>(...validators: ComposableValidator<T>[]): ComposableValidator<T> {
  return async (value: T, context: ValidationContext) => {
    const results = await Promise.all(validators.map((v) => v(value, context)));

    // If any validator passed, return success
    if (results.some((r) => r.valid)) {
      return success();
    }

    // All failed, return combined errors
    const merged = mergeResults(results);
    return {
      ...merged,
      valid: false,
    };
  };
}

/**
 * Applies a validator to each item in an array
 *
 * @example
 * const validateTools = arrayOf(
 *   oneOf(VALID_TOOLS)
 * );
 */
export function arrayOf<T>(
  itemValidator: ComposableValidator<T>
): ComposableValidator<T[]> {
  return async (values: T[], context: ValidationContext) => {
    const results = await Promise.all(
      values.map((item, index) =>
        itemValidator(item, {
          ...context,
          line: context.line ? context.line + index : undefined,
        })
      )
    );

    return mergeResults(results);
  };
}

/**
 * Applies a validator to each value in an object
 *
 * @example
 * const validateEnvVars = objectOf(
 *   validateEnvironmentVariable
 * );
 */
export function objectOf<T>(
  valueValidator: ComposableValidator<T>
): ComposableValidator<Record<string, T>> {
  return async (obj: Record<string, T>, context: ValidationContext) => {
    const results = await Promise.all(
      Object.entries(obj).map(([key, value]) =>
        valueValidator(value, {
          ...context,
          state: new Map(context.state).set('currentKey', key),
        })
      )
    );

    return mergeResults(results);
  };
}

/**
 * Maps a value before applying a validator
 *
 * @example
 * const validateUppercaseName = map(
 *   (name: string) => name.toUpperCase(),
 *   regex(/^[A-Z]+$/, 'Must be uppercase')
 * );
 */
export function map<T, U>(
  mapper: (value: T) => U,
  validator: ComposableValidator<U>
): ComposableValidator<T> {
  return async (value: T, context: ValidationContext) => {
    const mapped = mapper(value);
    return validator(mapped, context);
  };
}
