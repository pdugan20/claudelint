/**
 * Path validation utilities
 */
import { fileExists as fsFileExists, directoryExists as fsDirExists } from '../file-system';
import { ValidationIssue } from '../validation-helpers';

/**
 * Validate file exists
 * Used by: plugin-missing-file, hooks-missing-script, etc.
 */
export async function validateFileExists(
  path: string,
  context: string = 'File'
): Promise<ValidationIssue | null> {
  const exists = await fsFileExists(path);
  if (!exists) {
    return {
      message: `${context} not found: ${path}`,
      severity: 'error',
    };
  }
  return null;
}

/**
 * Validate directory exists
 */
export async function validateDirectoryExists(
  path: string,
  context: string = 'Directory'
): Promise<ValidationIssue | null> {
  const exists = await fsDirExists(path);
  if (!exists) {
    return {
      message: `${context} not found: ${path}`,
      severity: 'error',
    };
  }
  return null;
}

/**
 * Validate Windows path conventions (forward slashes)
 * Used by: skill-windows-paths
 */
export function validateForwardSlashes(path: string): ValidationIssue | null {
  if (path.includes('\\')) {
    return {
      message: 'Use forward slashes in paths, even on Windows',
      severity: 'warning',
    };
  }
  return null;
}
