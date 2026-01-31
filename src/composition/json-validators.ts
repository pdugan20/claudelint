/**
 * JSON-specific composable validators
 * Validators for working with JSON configuration files
 */

import { z } from 'zod';
import { ComposableValidator, ComposableValidationResult } from './types';
import { success, error, mergeResults } from './helpers';
import { readFileSync } from 'fs';

/**
 * Validates that a file contains valid JSON
 */
export function validJSON(): ComposableValidator<string> {
  return (filePath, context) => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      JSON.parse(content);
      return success();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return error(`Invalid JSON: ${message}`, context);
    }
  };
}

/**
 * Reads and parses JSON from a file
 * Returns the parsed object for further validation
 */
export function readJSON<T = unknown>(): ComposableValidator<string> {
  return (filePath, context) => {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content) as T;

      // Store parsed data in context state for downstream validators
      if (context.state) {
        context.state.set('parsedJSON', parsed);
      }

      return success();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return error(`Invalid JSON syntax: ${message}`, context);
    }
  };
}

/**
 * Validates parsed JSON data against a Zod schema
 * Expects parsed JSON to be in context.state.get('parsedJSON')
 */
export function zodSchema<T extends z.ZodType>(schema: T): ComposableValidator<unknown> {
  return (value, context) => {
    // If value is provided, validate it directly
    // Otherwise, get from context state
    const data = value ?? context.state?.get('parsedJSON');

    if (data === undefined) {
      return error('No data to validate', context);
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return error(`${path}${issue.message}`, context);
      });

      return mergeResults(errors);
    }

    // Store validated data in context for downstream validators
    if (context.state) {
      context.state.set('validatedData', result.data);
    }

    return success();
  };
}

/**
 * Validates object properties using a validator map
 * Allows declarative validation of object structure
 */
export function objectProperties<T extends Record<string, unknown>>(propertyValidators: {
  [K in keyof T]?: ComposableValidator<T[K]>;
}): ComposableValidator<T> {
  return async (obj, context) => {
    const validationPromises: Promise<ComposableValidationResult>[] = [];

    for (const [key, validatorValue] of Object.entries(propertyValidators)) {
      // Type assertion needed because Object.entries loses type information
      const validator = validatorValue as ComposableValidator<unknown> | undefined;

      if (!validator) {
        validationPromises.push(Promise.resolve(success()));
        continue;
      }

      const value = obj[key as keyof T];
      const validationResult: Promise<ComposableValidationResult> | ComposableValidationResult =
        validator(value, {
          ...context,
          state: new Map(context.state).set('currentProperty', key),
        });

      validationPromises.push(Promise.resolve(validationResult));
    }

    // Execute all validation promises
    const results: ComposableValidationResult[] = await Promise.all(validationPromises);
    return mergeResults(results);
  };
}

/**
 * Validates that a JSON file has required top-level keys
 */
export function requiredKeys(keys: string[]): ComposableValidator<unknown> {
  return (data, context) => {
    if (typeof data !== 'object' || data === null) {
      return error('Expected an object', context);
    }

    const obj = data as Record<string, unknown>;
    const missing = keys.filter((key) => !(key in obj));

    if (missing.length > 0) {
      return error(`Missing required keys: ${missing.join(', ')}`, context);
    }

    return success();
  };
}

/**
 * Validates that JSON object has no unknown keys
 */
export function noExtraKeys(allowedKeys: string[]): ComposableValidator<unknown> {
  return (data, context) => {
    if (typeof data !== 'object' || data === null) {
      return error('Expected an object', context);
    }

    const obj = data as Record<string, unknown>;
    const actualKeys = Object.keys(obj);
    const extraKeys = actualKeys.filter((key) => !allowedKeys.includes(key));

    if (extraKeys.length > 0) {
      return error(`Unknown keys: ${extraKeys.join(', ')}`, context);
    }

    return success();
  };
}
