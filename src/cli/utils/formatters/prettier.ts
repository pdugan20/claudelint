/**
 * Prettier Programmatic API Wrapper
 *
 * Provides a clean interface to Prettier's programmatic API.
 * Faster than execSync and better error handling.
 */

import * as prettier from 'prettier';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

export interface PrettierResult {
  passed: boolean;
  errors: string[];
  formatted: string[];
}

/**
 * Check if files are formatted with Prettier
 *
 * @param patterns - File glob patterns
 * @returns Result with passed status and lists of unformatted/formatted files
 */
export async function checkPrettier(patterns: string[]): Promise<PrettierResult> {
  const errors: string[] = [];
  const formatted: string[] = [];

  // Expand glob patterns to file list
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**'] });
    files.push(...matches);
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  for (const file of uniqueFiles) {
    try {
      const text = readFileSync(file, 'utf-8');
      const isFormatted = await prettier.check(text, { filepath: file });

      if (isFormatted) {
        formatted.push(file);
      } else {
        errors.push(file);
      }
    } catch {
      // Skip files that Prettier can't parse
      // (e.g., binary files, unsupported formats)
      continue;
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    formatted,
  };
}

/**
 * Format files with Prettier
 *
 * @param patterns - File glob patterns
 * @returns Result with passed status and lists of files
 */
export async function formatPrettier(patterns: string[]): Promise<PrettierResult> {
  const errors: string[] = [];
  const formatted: string[] = [];

  // Expand glob patterns to file list
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**'] });
    files.push(...matches);
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  for (const file of uniqueFiles) {
    try {
      const text = readFileSync(file, 'utf-8');
      const formattedText = await prettier.format(text, { filepath: file });

      // Only write if changed
      if (text !== formattedText) {
        writeFileSync(file, formattedText, 'utf-8');
        formatted.push(file);
      }
    } catch {
      // Track files that failed to format
      errors.push(file);
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    formatted,
  };
}
