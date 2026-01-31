/**
 * Core composable validators
 * Small, focused validators that can be composed together
 */

import { z } from 'zod';
import { ComposableValidator } from './types';
import { success, error } from './helpers';
import { fileExists as fsFileExists } from '../utils/filesystem/files';

/**
 * Validates that a file exists at the given path
 */
export function fileExists(): ComposableValidator<string> {
  return async (path, context) => {
    const exists = await fsFileExists(path);
    if (!exists) {
      return error(`File not found: ${path}`, context);
    }
    return success();
  };
}

/**
 * Validates value against a Zod schema
 */
export function jsonSchema<T extends z.ZodType>(schema: T): ComposableValidator<unknown> {
  return (value, context) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.message).join(', ');
      return error(`Schema validation failed: ${issues}`, context);
    }
    return success();
  };
}

/**
 * Validates string matches a regex pattern
 */
export function regex(pattern: RegExp, message: string): ComposableValidator<string> {
  return (value, context) => {
    if (!pattern.test(value)) {
      return error(message, context);
    }
    return success();
  };
}

/**
 * Validates string has minimum length
 */
export function minLength(min: number): ComposableValidator<string> {
  return (value, context) => {
    if (value.length < min) {
      return error(`Must be at least ${min} characters (got ${value.length})`, context);
    }
    return success();
  };
}

/**
 * Validates string has maximum length
 */
export function maxLength(max: number): ComposableValidator<string> {
  return (value, context) => {
    if (value.length > max) {
      return error(`Must be at most ${max} characters (got ${value.length})`, context);
    }
    return success();
  };
}

/**
 * Validates value is not null/undefined
 */
export function required<T>(): ComposableValidator<T | null | undefined> {
  return (value, context) => {
    if (value == null) {
      return error('Value is required', context);
    }
    return success();
  };
}

/**
 * Validates value is one of allowed values
 */
export function oneOf<T>(allowed: readonly T[]): ComposableValidator<T> {
  return (value, context) => {
    if (!allowed.includes(value)) {
      return error(`Must be one of: ${allowed.join(', ')}`, context);
    }
    return success();
  };
}

/**
 * Validates array has minimum length
 */
export function minItems(min: number): ComposableValidator<unknown[]> {
  return (values, context) => {
    if (values.length < min) {
      return error(`Must have at least ${min} items (got ${values.length})`, context);
    }
    return success();
  };
}

/**
 * Validates array has maximum length
 */
export function maxItems(max: number): ComposableValidator<unknown[]> {
  return (values, context) => {
    if (values.length > max) {
      return error(`Must have at most ${max} items (got ${values.length})`, context);
    }
    return success();
  };
}

/**
 * Validates number is within range
 */
export function range(min: number, max: number): ComposableValidator<number> {
  return (value, context) => {
    if (value < min || value > max) {
      return error(`Must be between ${min} and ${max} (got ${value})`, context);
    }
    return success();
  };
}

/**
 * Validates value is a non-empty string
 */
export function nonEmpty(): ComposableValidator<string> {
  return (value, context) => {
    if (value.trim().length === 0) {
      return error('Value must not be empty', context);
    }
    return success();
  };
}

/**
 * Validates value matches a type
 */
export function typeOf(expectedType: string): ComposableValidator<unknown> {
  return (value, context) => {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      return error(`Expected type ${expectedType}, got ${actualType}`, context);
    }
    return success();
  };
}

/**
 * Validates object has required keys
 */
export function hasKeys(keys: string[]): ComposableValidator<Record<string, unknown>> {
  return (obj, context) => {
    const missing = keys.filter((key) => !(key in obj));
    if (missing.length > 0) {
      return error(`Missing required keys: ${missing.join(', ')}`, context);
    }
    return success();
  };
}

/**
 * Validates value using a custom function
 */
export function custom<T>(
  validate: (value: T) => boolean,
  message: string
): ComposableValidator<T> {
  return (value, context) => {
    if (!validate(value)) {
      return error(message, context);
    }
    return success();
  };
}

/**
 * Always passes validation
 */
export function pass<T>(): ComposableValidator<T> {
  return () => success();
}

/**
 * Always fails validation
 */
export function fail<T>(message: string): ComposableValidator<T> {
  return (_, context) => error(message, context);
}
