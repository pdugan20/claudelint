/**
 * claudelint programmatic API
 *
 * This module provides the main programmatic API for claudelint, including
 * the ClaudeLint class, functional utilities, and all type definitions.
 *
 * @module api
 *
 * @example
 * ```typescript
 * // Class-based API
 * import { ClaudeLint } from 'claude-code-lint';
 *
 * const linter = new ClaudeLint({ fix: true });
 * const results = await linter.lintFiles(['**\/*.md']);
 * ```
 *
 * @example
 * ```typescript
 * // Functional API
 * import { lint, formatResults } from 'claude-code-lint';
 *
 * const results = await lint(['**\/*.md'], { fix: true });
 * const output = await formatResults(results, 'stylish');
 * ```
 */

// Type definitions
export type {
  // Result types
  LintResult,
  LintMessage,
  FixInfo,
  SuggestionInfo,

  // Options types
  ClaudeLintOptions,
  LintOptions,
  LintTextOptions,
  ConfigOptions,
  FileInfoOptions,
  LoadFormatterOptions,

  // Formatter types
  Formatter,
  FormatterOptions,

  // Metadata types
  RuleMetadata,
  FileInfo,
} from './types';

// Formatter utilities
export { loadFormatter, isBuiltinFormatter, BaseFormatter, BUILTIN_FORMATTERS } from './formatter';
export type { BuiltinFormatterName } from './formatter';

// Main ClaudeLint class
export { ClaudeLint } from './claudelint';

// Functional API
export { lint, lintText, resolveConfig, formatResults, getFileInfo } from './functions';
