/**
 * Functional API for claudelint
 *
 * This module provides stateless functional utilities for common operations.
 * These are convenience wrappers around the ClaudeLint class for simple use cases.
 *
 * @module api/functions
 */

import { ClaudeLint } from './claudelint';
import type { LintResult, LintOptions, LintTextOptions, FileInfo } from './types';
import type { ClaudeLintConfig } from '../utils/config';
import type { Formatter } from './types';

/**
 * Lint files using patterns
 *
 * This is a stateless wrapper around the ClaudeLint class for simple use cases.
 *
 * @param patterns - Glob patterns for files to lint
 * @param options - Linting options
 * @returns Promise resolving to array of lint results
 *
 * @example
 * ```typescript
 * import { lint } from '@pdugan20/claudelint';
 *
 * const results = await lint(['**\/*.md'], { fix: true });
 * console.log(`Found ${results.length} files`);
 * ```
 */
export async function lint(patterns: string[], options?: LintOptions): Promise<LintResult[]> {
  const linter = new ClaudeLint(options);
  return linter.lintFiles(patterns);
}

/**
 * Lint text content without accessing the filesystem
 *
 * @param code - Source code to lint
 * @param options - Linting options including virtual file path
 * @returns Promise resolving to array with single lint result
 *
 * @example
 * ```typescript
 * import { lintText } from '@pdugan20/claudelint';
 *
 * const code = '# CLAUDE.md\\n\\nSome content';
 * const results = await lintText(code, { filePath: 'CLAUDE.md' });
 * ```
 */
export async function lintText(code: string, options?: LintTextOptions): Promise<LintResult[]> {
  const linter = new ClaudeLint();
  return linter.lintText(code, options);
}

/**
 * Resolve configuration for a specific file path
 *
 * @param filePath - Path to resolve configuration for
 * @param options - Configuration resolution options
 * @returns Promise resolving to the configuration object
 *
 * @example
 * ```typescript
 * import { resolveConfig } from '@pdugan20/claudelint';
 *
 * const config = await resolveConfig('skills/test/SKILL.md');
 * console.log(config.rules);
 * ```
 */
export async function resolveConfig(
  filePath: string,
  options?: { cwd?: string }
): Promise<ClaudeLintConfig> {
  const linter = new ClaudeLint({ cwd: options?.cwd });
  return linter.calculateConfigForFile(filePath);
}

/**
 * Format lint results using a formatter
 *
 * @param results - Lint results to format
 * @param formatterName - Name of built-in formatter or path to custom formatter
 * @param options - Formatter options
 * @returns Promise resolving to formatted output string
 *
 * @example
 * ```typescript
 * import { lint, formatResults } from '@pdugan20/claudelint';
 *
 * const results = await lint(['**\/*.md']);
 * const output = await formatResults(results, 'stylish');
 * console.log(output);
 * ```
 */
export async function formatResults(
  results: LintResult[],
  formatterName: string = 'stylish',
  options?: { cwd?: string }
): Promise<string> {
  const linter = new ClaudeLint({ cwd: options?.cwd });
  const formatter: Formatter = await linter.loadFormatter(formatterName);
  return formatter.format(results);
}

/**
 * Get information about a file without linting it
 *
 * @param filePath - Path to get information for
 * @param options - File info options
 * @returns Promise resolving to file information
 *
 * @example
 * ```typescript
 * import { getFileInfo } from '@pdugan20/claudelint';
 *
 * const info = await getFileInfo('test.md');
 * console.log(`Ignored: ${info.ignored}`);
 * console.log(`Validators: ${info.validators.join(', ')}`);
 * ```
 */
export async function getFileInfo(filePath: string, options?: { cwd?: string }): Promise<FileInfo> {
  const linter = new ClaudeLint({ cwd: options?.cwd });

  // Check if file is ignored
  const ignored = linter.isPathIgnored(filePath);

  // Get validators that would run for this file
  // We'll use a minimal approach - import ValidatorRegistry directly
  const { ValidatorRegistry } = await import('../utils/validator-factory');
  const allValidators = ValidatorRegistry.getAll({
    path: filePath,
    verbose: false,
  });

  // Get validator names (we'll need to extract this from metadata)
  const validatorNames: string[] = [];
  for (const validator of allValidators) {
    // Validators don't expose their names directly, so we'll use their constructor names
    validatorNames.push(validator.constructor.name);
  }

  return {
    ignored,
    validators: validatorNames,
  };
}
