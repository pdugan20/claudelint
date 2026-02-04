/**
 * Diagnostic Collection System
 *
 * Provides centralized diagnostic collection for warnings, errors, and info messages
 * across the validation pipeline. Inspired by ESLint, TypeScript compiler, and Webpack.
 *
 * @example
 * ```typescript
 * const diagnostics = new DiagnosticCollector();
 *
 * // Collect warnings
 * diagnostics.warn('Invalid configuration', 'ConfigResolver', 'CONFIG_001');
 *
 * // Collect errors
 * diagnostics.error('Failed to parse', 'WorkspaceDetector', 'WORKSPACE_001');
 *
 * // Query collected diagnostics
 * const warnings = diagnostics.getWarnings();
 * const errors = diagnostics.getErrors();
 * ```
 */

/**
 * Diagnostic severity levels
 */
export type DiagnosticSeverity = 'info' | 'warning' | 'error';

/**
 * A diagnostic message collected during validation
 */
export interface Diagnostic {
  /** Human-readable diagnostic message */
  message: string;

  /** Source component that generated this diagnostic (e.g., 'ConfigResolver', 'CacheManager') */
  source: string;

  /** Severity level of the diagnostic */
  severity: DiagnosticSeverity;

  /** Optional diagnostic code for filtering/documentation (e.g., 'CONFIG_001', 'CACHE_SAVE_FAILED') */
  code?: string;

  /** Optional additional context data for debugging */
  context?: Record<string, unknown>;
}

/**
 * Centralized diagnostic collector for validation pipeline
 *
 * Accumulates diagnostics from all components during validation.
 * Diagnostics are structured messages with source tracking, severity levels,
 * and optional codes for filtering and documentation.
 *
 * @example
 * ```typescript
 * // Create collector at top of validation pipeline
 * const diagnostics = new DiagnosticCollector();
 *
 * // Thread through components
 * const resolver = new ConfigResolver(config, diagnostics);
 * const workspace = detectWorkspace(dir, diagnostics);
 *
 * // Components add diagnostics
 * diagnostics.warn('Cache write failed', 'CacheManager', 'CACHE_001');
 *
 * // Collect at end
 * const warnings = diagnostics.getWarnings();
 * ```
 */
export class DiagnosticCollector {
  private diagnostics: Diagnostic[] = [];

  /**
   * Add a diagnostic
   *
   * @param diagnostic - The diagnostic to add
   *
   * @example
   * ```typescript
   * collector.add({
   *   message: 'Invalid options',
   *   source: 'ConfigResolver',
   *   severity: 'warning',
   *   code: 'CONFIG_001'
   * });
   * ```
   */
  add(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  /**
   * Add a warning diagnostic
   *
   * Convenience method for adding warnings with consistent severity.
   *
   * @param message - Human-readable warning message
   * @param source - Component that generated the warning
   * @param code - Optional diagnostic code
   * @param context - Optional additional context data
   *
   * @example
   * ```typescript
   * diagnostics.warn(
   *   'Invalid rule options. Rule will be disabled.',
   *   'ConfigResolver',
   *   'CONFIG_INVALID_OPTIONS'
   * );
   * ```
   */
  warn(message: string, source: string, code?: string, context?: Record<string, unknown>): void {
    this.add({ message, source, severity: 'warning', code, context });
  }

  /**
   * Add an error diagnostic
   *
   * Convenience method for adding errors with consistent severity.
   *
   * @param message - Human-readable error message
   * @param source - Component that generated the error
   * @param code - Optional diagnostic code
   * @param context - Optional additional context data
   *
   * @example
   * ```typescript
   * diagnostics.error(
   *   'Failed to clear cache',
   *   'CacheManager',
   *   'CACHE_CLEAR_FAILED'
   * );
   * ```
   */
  error(message: string, source: string, code?: string, context?: Record<string, unknown>): void {
    this.add({ message, source, severity: 'error', code, context });
  }

  /**
   * Add an info diagnostic
   *
   * Convenience method for adding informational messages.
   *
   * @param message - Human-readable info message
   * @param source - Component that generated the message
   * @param code - Optional diagnostic code
   * @param context - Optional additional context data
   *
   * @example
   * ```typescript
   * diagnostics.info(
   *   'Using cached results',
   *   'CacheManager',
   *   'CACHE_HIT'
   * );
   * ```
   */
  info(message: string, source: string, code?: string, context?: Record<string, unknown>): void {
    this.add({ message, source, severity: 'info', code, context });
  }

  /**
   * Get all collected diagnostics
   *
   * Returns a copy of all diagnostics to prevent external mutation.
   *
   * @returns Array of all diagnostics
   *
   * @example
   * ```typescript
   * const all = diagnostics.getAll();
   * console.log(`Collected ${all.length} diagnostics`);
   * ```
   */
  getAll(): Diagnostic[] {
    return [...this.diagnostics];
  }

  /**
   * Get all warning diagnostics
   *
   * @returns Array of warnings only
   *
   * @example
   * ```typescript
   * const warnings = diagnostics.getWarnings();
   * if (warnings.length > 0) {
   *   console.warn(`Found ${warnings.length} warnings`);
   * }
   * ```
   */
  getWarnings(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.severity === 'warning');
  }

  /**
   * Get all error diagnostics
   *
   * @returns Array of errors only
   *
   * @example
   * ```typescript
   * const errors = diagnostics.getErrors();
   * if (errors.length > 0) {
   *   console.error(`Found ${errors.length} errors`);
   * }
   * ```
   */
  getErrors(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.severity === 'error');
  }

  /**
   * Get all info diagnostics
   *
   * @returns Array of info messages only
   *
   * @example
   * ```typescript
   * const info = diagnostics.getInfo();
   * ```
   */
  getInfo(): Diagnostic[] {
    return this.diagnostics.filter((d) => d.severity === 'info');
  }

  /**
   * Clear all collected diagnostics
   *
   * Useful for resetting between validation runs.
   *
   * @example
   * ```typescript
   * diagnostics.clear();
   * // Start fresh validation
   * ```
   */
  clear(): void {
    this.diagnostics = [];
  }

  /**
   * Check if any warnings were collected
   *
   * @returns True if at least one warning exists
   *
   * @example
   * ```typescript
   * if (diagnostics.hasWarnings()) {
   *   console.warn('Validation completed with warnings');
   * }
   * ```
   */
  hasWarnings(): boolean {
    return this.diagnostics.some((d) => d.severity === 'warning');
  }

  /**
   * Check if any errors were collected
   *
   * @returns True if at least one error exists
   *
   * @example
   * ```typescript
   * if (diagnostics.hasErrors()) {
   *   console.error('Validation completed with errors');
   * }
   * ```
   */
  hasErrors(): boolean {
    return this.diagnostics.some((d) => d.severity === 'error');
  }

  /**
   * Get total count of collected diagnostics
   *
   * @returns Total number of diagnostics
   *
   * @example
   * ```typescript
   * console.log(`Collected ${diagnostics.count()} diagnostics`);
   * ```
   */
  count(): number {
    return this.diagnostics.length;
  }
}
