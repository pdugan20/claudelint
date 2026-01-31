/**
 * Formatter system for claudelint programmatic API
 *
 * This module provides the formatter interface and loading utilities for
 * formatting lint results into various output formats.
 *
 * @module api/formatter
 */

import { Formatter, FormatterOptions, LoadFormatterOptions, LintResult } from './types';
import { existsSync } from 'fs';
import { resolve, isAbsolute } from 'path';

/**
 * Built-in formatter names
 */
export const BUILTIN_FORMATTERS = ['stylish', 'json', 'compact'] as const;

export type BuiltinFormatterName = (typeof BUILTIN_FORMATTERS)[number];

/**
 * Check if a formatter name is a built-in formatter
 */
export function isBuiltinFormatter(name: string): name is BuiltinFormatterName {
  return BUILTIN_FORMATTERS.includes(name as BuiltinFormatterName);
}

/**
 * Load a formatter by name or path
 *
 * @param nameOrPath - Built-in formatter name or path to custom formatter
 * @param options - Loading options
 * @returns Formatter instance
 *
 * @example
 * ```typescript
 * // Load built-in formatter
 * const formatter = await loadFormatter('stylish');
 *
 * // Load custom formatter
 * const formatter = await loadFormatter('./my-formatter.js');
 * ```
 */
export async function loadFormatter(
  nameOrPath: string,
  options: LoadFormatterOptions = {}
): Promise<Formatter> {
  const cwd = options.cwd || process.cwd();

  // Check if it's a built-in formatter
  if (isBuiltinFormatter(nameOrPath)) {
    return loadBuiltinFormatter(nameOrPath);
  }

  // Try to load as custom formatter from path
  return loadCustomFormatter(nameOrPath, cwd);
}

/**
 * Load a built-in formatter
 */
async function loadBuiltinFormatter(name: BuiltinFormatterName): Promise<Formatter> {
  switch (name) {
    case 'stylish':
      const { StylishFormatter } = await import('./formatters/stylish');
      return new StylishFormatter();

    case 'json':
      const { JsonFormatter } = await import('./formatters/json');
      return new JsonFormatter();

    case 'compact':
      const { CompactFormatter } = await import('./formatters/compact');
      return new CompactFormatter();

    default:
      // TypeScript ensures this is unreachable
      throw new Error(`Unknown built-in formatter: ${name}`);
  }
}

/**
 * Load a custom formatter from a file path
 */
async function loadCustomFormatter(filePath: string, cwd: string): Promise<Formatter> {
  // Resolve path relative to cwd
  const resolvedPath = isAbsolute(filePath) ? filePath : resolve(cwd, filePath);

  // Check if file exists
  if (!existsSync(resolvedPath)) {
    throw new Error(`Formatter not found: ${resolvedPath}`);
  }

  // Import the formatter module
  let formatterModule;
  try {
    formatterModule = await import(resolvedPath);
  } catch (error) {
    throw new Error(
      `Failed to load formatter from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Extract formatter (handle both default and named exports)
  const formatter = formatterModule.default || formatterModule;

  // Validate formatter interface
  if (!formatter || typeof formatter.format !== 'function') {
    throw new Error(
      `Invalid formatter: ${resolvedPath} must export an object with a format() method`
    );
  }

  return formatter;
}

/**
 * Validate that an object implements the Formatter interface
 */
export function isFormatter(obj: unknown): obj is Formatter {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'format' in obj &&
    typeof (obj as { format: unknown }).format === 'function'
  );
}

/**
 * Base class for formatters (optional convenience)
 */
export abstract class BaseFormatter implements Formatter {
  protected options: FormatterOptions;

  constructor(options: FormatterOptions = {}) {
    this.options = options;
  }

  abstract format(results: LintResult[]): string;

  /**
   * Get relative path for display
   */
  protected getRelativePath(filePath: string): string {
    const cwd = this.options.cwd || process.cwd();
    return filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath;
  }

  /**
   * Calculate summary statistics
   */
  protected getSummary(results: LintResult[]) {
    let errorCount = 0;
    let warningCount = 0;
    let fixableErrorCount = 0;
    let fixableWarningCount = 0;

    for (const result of results) {
      errorCount += result.errorCount;
      warningCount += result.warningCount;
      fixableErrorCount += result.fixableErrorCount;
      fixableWarningCount += result.fixableWarningCount;
    }

    return {
      fileCount: results.length,
      errorCount,
      warningCount,
      fixableErrorCount,
      fixableWarningCount,
      totalIssues: errorCount + warningCount,
    };
  }
}
