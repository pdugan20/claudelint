// ============================================================================
// claude-code-lint Programmatic API
// ============================================================================
//
// This module provides the public API for claude-code-lint, following the same
// patterns as ESLint and Prettier. Only stable, documented APIs are exported.
//
// Internal implementation details (validators, registries, etc.) are NOT
// exported to maintain API stability and allow refactoring without breaking
// changes.
//
// @see https://eslint.org/docs/latest/integrate/nodejs-api
// @see https://prettier.io/docs/api
//
// ============================================================================

// ============================================================================
// Main API Class
// ============================================================================

/**
 * Main ClaudeLint class for programmatic usage
 *
 * @example
 * ```typescript
 * import { ClaudeLint } from 'claude-code-lint';
 *
 * const linter = new ClaudeLint({ fix: true });
 * const results = await linter.lintFiles(['**\/*.md']);
 * ```
 */
export { ClaudeLint } from './api/claude-code-lint';

// ============================================================================
// Type Definitions
// ============================================================================

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

  // Formatter types
  Formatter,
  FormatterOptions,
  LoadFormatterOptions,

  // Metadata types
  RuleMetadata,
  FileInfo,
} from './api/types';

// ============================================================================
// Formatter Utilities
// ============================================================================

/**
 * Load a formatter by name or path
 *
 * @example
 * ```typescript
 * import { loadFormatter } from 'claude-code-lint';
 *
 * const formatter = await loadFormatter('stylish');
 * ```
 */
export {
  loadFormatter,
  isBuiltinFormatter,
  BaseFormatter,
  BUILTIN_FORMATTERS,
} from './api/formatter';
export type { BuiltinFormatterName } from './api/formatter';

// ============================================================================
// Configuration Utilities
// ============================================================================

/**
 * Configuration types and utilities
 *
 * @example
 * ```typescript
 * import { findConfigFile, loadConfig } from 'claude-code-lint';
 *
 * const configPath = await findConfigFile(process.cwd());
 * const config = loadConfig(configPath);
 * ```
 */
export type { ClaudeLintConfig, RuleConfig, ConfigOverride } from './utils/config';
export { findConfigFile, loadConfig } from './utils/config';

// ============================================================================
// Functional API
// ============================================================================

/**
 * Functional API utilities for stateless operations
 *
 * @example
 * ```typescript
 * import { lint, formatResults } from 'claude-code-lint';
 *
 * const results = await lint(['**\/*.md'], { fix: true });
 * const output = await formatResults(results, 'stylish');
 * ```
 */
export { lint, lintText, resolveConfig, formatResults, getFileInfo } from './api/functions';

// ============================================================================
// Internal Implementation (NOT EXPORTED)
// ============================================================================
//
// The following are internal implementation details and are NOT part of the
// public API. They may change at any time without notice:
//
// - Validators (SkillsValidator, ClaudeMdValidator, etc.)
// - ValidatorRegistry
// - Internal utilities (except config utilities above)
// - Rule implementations
// - Schema definitions
//
// Users should only use the ClaudeLint class and related types above.
//
// ============================================================================
