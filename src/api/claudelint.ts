/**
 * Main ClaudeLint class for programmatic API
 *
 * This module provides the primary class-based interface for linting Claude Code
 * projects programmatically. It handles configuration, file discovery, validation
 * orchestration, and result formatting.
 *
 * @module api/claudelint
 *
 * @example
 * ```typescript
 * import { ClaudeLint } from 'claude-code-lint';
 *
 * const linter = new ClaudeLint({
 *   fix: true,
 *   cache: true
 * });
 *
 * const results = await linter.lintFiles(['**\/*.md']);
 * const formatter = await linter.loadFormatter('stylish');
 * console.log(formatter.format(results));
 * ```
 */

import { ClaudeLintOptions, LintResult, LintTextOptions, Formatter, LintMessage } from './types';
import { RuleMetadata } from '../types/rule';
import { ClaudeLintConfig, findConfigFile, loadConfig } from '../utils/config/types';
import { loadFormatter as loadFormatterUtil } from './formatter';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { minimatch } from 'minimatch';
import { RuleRegistry } from '../utils/rules/registry';
import { buildLintMessage } from './message-builder';
import packageJson from '../../package.json';

/**
 * Main class for linting Claude Code projects programmatically
 *
 * The ClaudeLint class provides a high-level API for validating Claude Code files,
 * managing configuration, applying fixes, and formatting results. It mirrors the
 * design of ESLint's programmatic API for familiarity.
 *
 * @example
 * ```typescript
 * const linter = new ClaudeLint({
 *   fix: true,
 *   cache: true,
 *   onProgress: (file, idx, total) => {
 *     console.log(`[${idx}/${total}] ${file}`);
 *   }
 * });
 *
 * const results = await linter.lintFiles(['**\/*.md', '**\/*.json']);
 * ```
 */
export class ClaudeLint {
  /**
   * Configuration object for this linter instance
   */
  private config: ClaudeLintConfig;

  /**
   * Working directory for this linter instance
   */
  private cwd: string;

  /**
   * Linter options
   */
  private options: Required<
    Omit<
      ClaudeLintOptions,
      | 'config'
      | 'overrideConfigFile'
      | 'onStart'
      | 'onProgress'
      | 'onComplete'
      | 'ruleFilter'
      | 'fix'
    >
  > & {
    config?: ClaudeLintConfig;
    overrideConfigFile?: string;
    onStart?: (fileCount: number) => void;
    onProgress?: (file: string, index: number, total: number) => void;
    onComplete?: (results: LintResult[]) => void;
    ruleFilter?: (ruleId: string) => boolean;
    fix?: boolean | ((message: LintMessage) => boolean);
  };

  /**
   * Cache for loaded formatters
   */
  private formatterCache: Map<string, Formatter> = new Map();

  /**
   * Creates a new ClaudeLint instance
   *
   * @param options - Configuration options for the linter
   *
   * @example
   * ```typescript
   * // With default options
   * const linter = new ClaudeLint();
   *
   * // With custom configuration
   * const linter = new ClaudeLint({
   *   fix: true,
   *   cache: true,
   *   config: {
   *     rules: {
   *       'claude-md-size-limit': 'error'
   *     }
   *   }
   * });
   *
   * // With configuration file
   * const linter = new ClaudeLint({
   *   overrideConfigFile: './custom-config.json'
   * });
   * ```
   */
  constructor(options: ClaudeLintOptions = {}) {
    // Set working directory
    this.cwd = options.cwd || process.cwd();

    // Set default options
    this.options = {
      // Configuration
      config: options.config,
      overrideConfigFile: options.overrideConfigFile,

      // Linting behavior
      fix: options.fix ?? false,
      fixTypes: options.fixTypes ?? [],
      allowInlineConfig: options.allowInlineConfig ?? true,
      reportUnusedDisableDirectives: options.reportUnusedDisableDirectives ?? false,

      // File handling
      cwd: this.cwd,
      ignore: options.ignore ?? true,
      ignorePatterns: options.ignorePatterns ?? [],
      errorOnUnmatchedPattern: options.errorOnUnmatchedPattern ?? true,

      // Caching
      cache: options.cache ?? false,
      cacheLocation: options.cacheLocation ?? '.claudelint-cache',
      cacheStrategy: options.cacheStrategy ?? 'metadata',

      // Callbacks
      onStart: options.onStart,
      onProgress: options.onProgress,
      onComplete: options.onComplete,

      // Filtering
      ruleFilter: options.ruleFilter,
    };

    // Load configuration (will be implemented in Task 1.2.2)
    this.config = this.loadConfiguration();

    // Initialize cache (will be implemented in Task 1.2.3)
    this.initializeCache();
  }

  /**
   * Lint files matching the provided glob patterns
   *
   * @param patterns - Glob patterns to match files
   * @returns Promise resolving to array of lint results
   *
   * @example
   * ```typescript
   * const results = await linter.lintFiles([
   *   '**\/*.md',
   *   '**\/*.json',
   *   'skills/**\/*.sh'
   * ]);
   *
   * console.log(`Linted ${results.length} files`);
   * ```
   */
  async lintFiles(patterns: string[]): Promise<LintResult[]> {
    // Task 1.4.1: File discovery
    const files = await this.discoverFiles(patterns);

    // Call onStart callback if provided
    if (this.options.onStart) {
      this.options.onStart(files.length);
    }

    // Task 1.4.2 & 1.4.3: Validation orchestration
    const results: LintResult[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Call onProgress callback if provided
      if (this.options.onProgress) {
        this.options.onProgress(file, i + 1, files.length);
      }

      // Validate the file
      const result = await this.validateFile(file);
      results.push(result);
    }

    // Call onComplete callback if provided
    if (this.options.onComplete) {
      this.options.onComplete(results);
    }

    return results;
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
   * const results = await linter.lintText(
   *   '# CLAUDE.md\\n\\nSome content',
   *   { filePath: 'CLAUDE.md' }
   * );
   * ```
   */
  async lintText(code: string, options: LintTextOptions = {}): Promise<LintResult[]> {
    const { writeFileSync, unlinkSync, mkdirSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    const { randomBytes } = await import('crypto');

    // Determine the effective file path
    const fileName = options.filePath || `temp-${randomBytes(8).toString('hex')}.md`;
    const effectivePath = resolve(this.cwd, fileName);

    // Check if the path would be ignored
    if (options.warnIgnored && this.isPathIgnored(effectivePath)) {
      const { buildLintResult } = await import('./result-builder');

      return [
        buildLintResult(
          effectivePath,
          {
            valid: false,
            errors: [],
            warnings: [
              {
                message: 'File ignored due to configuration',
                file: effectivePath,
                severity: 'warning',
                line: 1,
                explanation: `The file at ${effectivePath} matches an ignore pattern in your configuration and was not linted.`,
              },
            ],
          },
          code,
          undefined,
          0
        ),
      ];
    }

    // Create a temporary file to validate
    const tmpDir = join(tmpdir(), 'claudelint-linttext');
    const tmpFile = join(tmpDir, `${randomBytes(16).toString('hex')}.tmp`);

    try {
      // Ensure tmp directory exists
      mkdirSync(tmpDir, { recursive: true });

      // Write content to temporary file
      writeFileSync(tmpFile, code, 'utf-8');

      // Create a temporary validator that points to the tmp file
      // but we'll use the effective path for reporting
      const result = await this.validateTextFile(tmpFile, effectivePath, code);

      return [result];
    } finally {
      // Clean up temporary file
      try {
        unlinkSync(tmpFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Calculate the configuration that would be used for a specific file
   *
   * @param filePath - Path to the file
   * @returns Promise resolving to the configuration object
   *
   * @example
   * ```typescript
   * const config = await linter.calculateConfigForFile('skills/test/SKILL.md');
   * console.log(config.rules);
   * ```
   */
  async calculateConfigForFile(filePath: string): Promise<ClaudeLintConfig> {
    const { minimatch } = await import('minimatch');

    // Start with base config
    const mergedConfig: ClaudeLintConfig = {
      ...this.config,
      rules: { ...(this.config.rules || {}) },
    };

    // Apply overrides that match this file path
    if (this.config.overrides) {
      for (const override of this.config.overrides) {
        // Check if any of the override's file patterns match
        const matches = override.files.some((pattern) =>
          minimatch(filePath, pattern, { dot: true })
        );

        if (matches) {
          // Merge override rules into the config
          mergedConfig.rules = {
            ...mergedConfig.rules,
            ...override.rules,
          };
        }
      }
    }

    return mergedConfig;
  }

  /**
   * Check if a file path would be ignored by configuration
   *
   * @param filePath - Path to check
   * @returns True if the path would be ignored
   *
   * @example
   * ```typescript
   * if (linter.isPathIgnored('node_modules/foo.md')) {
   *   console.log('File would be ignored');
   * }
   * ```
   */
  isPathIgnored(filePath: string): boolean {
    // No ignore patterns configured
    if (!this.config.ignorePatterns || this.config.ignorePatterns.length === 0) {
      return false;
    }

    // Check if file matches any ignore pattern
    return this.config.ignorePatterns.some((pattern) =>
      minimatch(filePath, pattern, { dot: true })
    );
  }

  /**
   * Load a formatter for formatting lint results
   *
   * @param nameOrPath - Built-in formatter name or path to custom formatter
   * @returns Promise resolving to formatter instance
   *
   * @example
   * ```typescript
   * // Load built-in formatter
   * const formatter = await linter.loadFormatter('stylish');
   *
   * // Load custom formatter
   * const formatter = await linter.loadFormatter('./my-formatter.js');
   * ```
   */
  async loadFormatter(nameOrPath: string): Promise<Formatter> {
    // Check cache first
    if (this.formatterCache.has(nameOrPath)) {
      return this.formatterCache.get(nameOrPath)!;
    }

    // Load formatter
    const formatter = await loadFormatterUtil(nameOrPath, { cwd: this.cwd });

    // Cache it
    this.formatterCache.set(nameOrPath, formatter);

    return formatter;
  }

  /**
   * Get metadata for all registered rules
   *
   * @returns Map of rule ID to rule metadata
   *
   * @example
   * ```typescript
   * const rules = linter.getRules();
   * for (const [ruleId, meta] of rules) {
   *   console.log(`${ruleId}: ${meta.description}`);
   * }
   * ```
   */
  getRules(): Map<string, RuleMetadata> {
    const metaMap = new Map<string, RuleMetadata>();

    // Get all registered rules
    const allRules = RuleRegistry.getAllRules();

    for (const rule of allRules) {
      metaMap.set(rule.meta.id, rule.meta);
    }

    return metaMap;
  }

  /**
   * Get metadata for rules that were triggered in the given results
   *
   * @param results - Lint results to extract rule metadata from
   * @returns Map of rule ID to rule metadata (only for triggered rules)
   *
   * @example
   * ```typescript
   * const results = await linter.lintFiles(['**\/*.md']);
   * const meta = linter.getRulesMetaForResults(results);
   * ```
   */
  getRulesMetaForResults(results: LintResult[]): Map<string, RuleMetadata> {
    const metaMap = new Map<string, RuleMetadata>();

    // Extract unique rule IDs from all results
    const ruleIds = new Set<string>();
    for (const result of results) {
      for (const message of result.messages) {
        if (message.ruleId) {
          ruleIds.add(message.ruleId);
        }
      }
      // Also check suppressed messages
      for (const message of result.suppressedMessages) {
        if (message.ruleId) {
          ruleIds.add(message.ruleId);
        }
      }
    }

    // Load metadata for each rule
    for (const ruleId of ruleIds) {
      const metadata = RuleRegistry.get(ruleId);
      if (metadata) {
        metaMap.set(ruleId, metadata);
      }
    }

    return metaMap;
  }

  // Static methods
  // ==============

  /**
   * Write fixed content to disk for all fixable results
   *
   * @param results - Lint results with fix information
   * @returns Promise that resolves when all fixes are written
   *
   * @example
   * ```typescript
   * const linter = new ClaudeLint({ fix: true });
   * const results = await linter.lintFiles(['**\/*.md']);
   * await ClaudeLint.outputFixes(results);
   * ```
   */
  static async outputFixes(results: LintResult[]): Promise<void> {
    const { writeFileSync } = await import('fs');

    for (const result of results) {
      // Only write if there's fixed output
      if (result.output && result.output !== result.source) {
        try {
          writeFileSync(result.filePath, result.output, 'utf-8');
        } catch (error) {
          throw new Error(
            `Failed to write fixes to ${result.filePath}: ${(error as Error).message}`
          );
        }
      }
    }
  }

  /**
   * Get fixed content without writing to disk
   *
   * @param results - Lint results with fix information
   * @returns Map of file path to fixed content
   *
   * @example
   * ```typescript
   * const fixed = ClaudeLint.getFixedContent(results);
   * for (const [path, content] of fixed) {
   *   console.log(`${path} would be fixed`);
   * }
   * ```
   */
  static getFixedContent(results: LintResult[]): Map<string, string> {
    const fixedContent = new Map<string, string>();

    for (const result of results) {
      // Only include files that have fixes applied
      if (result.output && result.output !== result.source) {
        fixedContent.set(result.filePath, result.output);
      }
    }

    return fixedContent;
  }

  /**
   * Filter results to only those with errors
   *
   * @param results - All lint results
   * @returns Results with errorCount > 0
   *
   * @example
   * ```typescript
   * const errors = ClaudeLint.getErrorResults(results);
   * if (errors.length > 0) {
   *   process.exit(1);
   * }
   * ```
   */
  static getErrorResults(results: LintResult[]): LintResult[] {
    return results.filter((result) => result.errorCount > 0);
  }

  /**
   * Filter results to only those with warnings
   *
   * @param results - Array of lint results
   * @returns New array containing only results with warnings
   *
   * @example
   * ```typescript
   * const results = await linter.lintFiles(['**\/*.md']);
   * const warnings = ClaudeLint.getWarningResults(results);
   * console.log(`Found ${warnings.length} files with warnings`);
   * ```
   */
  static getWarningResults(results: LintResult[]): LintResult[] {
    return results.filter((result) => result.warningCount > 0);
  }

  /**
   * Find the configuration file starting from a directory
   *
   * @param cwd - Directory to start search from
   * @returns Config file path or null
   *
   * @example
   * ```typescript
   * const configPath = ClaudeLint.findConfigFile(process.cwd());
   * if (configPath) {
   *   console.log(`Using config: ${configPath}`);
   * }
   * ```
   */
  static findConfigFile(cwd: string): string | null {
    return findConfigFile(cwd);
  }

  /**
   * Get the claudelint version
   *
   * @returns Version string
   *
   * @example
   * ```typescript
   * console.log(`Using claudelint ${ClaudeLint.getVersion()}`);
   * ```
   */
  static getVersion(): string {
    return (packageJson as { version: string }).version;
  }

  // Private methods
  // ===============

  /**
   * Load configuration from file or use provided config
   * Implemented in Task 1.2.2
   */
  private loadConfiguration(): ClaudeLintConfig {
    // If explicit config provided, use it
    if (this.options.config) {
      return this.options.config;
    }

    // If config file override specified, load it
    if (this.options.overrideConfigFile) {
      const configPath = resolve(this.cwd, this.options.overrideConfigFile);
      if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      return loadConfig(configPath);
    }

    // Try to find config file automatically
    const configPath = findConfigFile(this.cwd);
    if (configPath) {
      return loadConfig(configPath);
    }

    // No config found, use defaults
    return {};
  }

  /**
   * Initialize cache system
   * Implemented in Task 1.2.3
   */
  private initializeCache(): void {
    // Cache initialization will be implemented here
    // For now, just a placeholder
    if (this.options.cache) {
      // TODO: Initialize cache system
    }
  }

  /**
   * Discover files matching the given patterns
   * Task 1.4.1: File discovery
   */
  private async discoverFiles(patterns: string[]): Promise<string[]> {
    const { glob } = await import('glob');
    const allFiles: Set<string> = new Set();

    // Find all files matching patterns
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: this.cwd,
        absolute: true,
        nodir: true,
        ignore: this.options.ignore ? this.options.ignorePatterns : [],
      });

      for (const file of matches) {
        allFiles.add(file);
      }
    }

    // Convert to array and sort
    const files = Array.from(allFiles).sort();

    // Error on unmatched patterns if configured
    if (this.options.errorOnUnmatchedPattern && files.length === 0 && patterns.length > 0) {
      throw new Error(`No files matching patterns: ${patterns.join(', ')}`);
    }

    return files;
  }

  /**
   * Validate a single file
   * Task 1.4.2 & 1.4.3: Validation orchestration and validator integration
   */
  private async validateFile(filePath: string): Promise<LintResult> {
    const { ValidatorRegistry } = await import('../utils/validators/factory');
    const { buildLintResult, buildCleanResult } = await import('./result-builder');
    const { readFileSync } = await import('fs');
    const fileStartTime = Date.now();

    try {
      // Read file content
      const source = readFileSync(filePath, 'utf-8');

      // Get all registered validators
      const allValidators = ValidatorRegistry.getAll({
        path: filePath,
        verbose: false,
        config: this.config,
      });

      // Determine which validators should run for this file
      const applicableValidators = this.getApplicableValidators(filePath, allValidators);

      // If no validators apply, return clean result
      if (applicableValidators.length === 0) {
        return buildCleanResult(filePath, source, Date.now() - fileStartTime);
      }

      // Run all applicable validators
      const validationResults = await Promise.all(
        applicableValidators.map(async (validator) => {
          try {
            return await validator.validate();
          } catch (error) {
            // If a validator fails, return it as an error in ValidationResult
            return {
              valid: false,
              errors: [
                {
                  message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
                  file: filePath,
                  severity: 'error' as const,
                },
              ],
              warnings: [],
            };
          }
        })
      );

      // Merge all validation results
      const mergedResult = this.mergeValidationResults(validationResults);

      // Apply fixes if fix option is enabled
      let output: string | undefined;
      if (this.shouldApplyFixes()) {
        output = this.applyFixes(source, mergedResult);
      }

      // Convert to LintResult format
      const lintResult = buildLintResult(
        filePath,
        mergedResult,
        source,
        output,
        Date.now() - fileStartTime
      );

      return lintResult;
    } catch (error) {
      // File read error or other unexpected error
      const { createFileReadError } = await import('./message-builder');
      const errorMessage = createFileReadError(filePath, error as Error);

      return {
        filePath,
        messages: [errorMessage],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        stats: {
          validationTime: Date.now() - fileStartTime,
        },
      };
    }
  }

  /**
   * Determine which validators should run for a given file
   *
   * Currently runs all validators for every file. Could be optimized to filter
   * validators based on file patterns and config, but this is not a priority
   * since validation is already fast.
   */
  private getApplicableValidators(
    _filePath: string,
    allValidators: import('../validators/file-validator').FileValidator[]
  ): import('../validators/file-validator').FileValidator[] {
    return allValidators;
  }

  /**
   * Validate text content from a temporary file
   *
   * Similar to validateFile but uses a temporary file location for validation
   * while reporting results against the effective file path.
   *
   * @param tmpFile - Path to temporary file containing the content
   * @param effectivePath - Path to report in results (the "virtual" file path)
   * @param source - The original source code
   * @returns Promise resolving to lint result
   */
  private async validateTextFile(
    tmpFile: string,
    effectivePath: string,
    source: string
  ): Promise<LintResult> {
    const { ValidatorRegistry } = await import('../utils/validators/factory');
    const { buildLintResult, buildCleanResult } = await import('./result-builder');
    const fileStartTime = Date.now();

    try {
      // Get all registered validators (using the effective path for determining applicability)
      const allValidators = ValidatorRegistry.getAll({
        path: tmpFile, // Validators will read from tmpFile
        verbose: false,
        config: this.config,
      });

      // Determine which validators should run based on the effective path
      const applicableValidators = this.getApplicableValidators(effectivePath, allValidators);

      // If no validators apply, return clean result
      if (applicableValidators.length === 0) {
        return buildCleanResult(effectivePath, source, Date.now() - fileStartTime);
      }

      // Run all applicable validators
      const validationResults = await Promise.all(
        applicableValidators.map(async (validator) => {
          try {
            return await validator.validate();
          } catch (error) {
            // If a validator fails, return it as an error in ValidationResult
            return {
              valid: false,
              errors: [
                {
                  message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
                  file: effectivePath,
                  severity: 'error' as const,
                },
              ],
              warnings: [],
            };
          }
        })
      );

      // Merge all validation results
      const mergedResult = this.mergeValidationResults(validationResults);

      // Apply fixes if fix option is enabled
      let output: string | undefined;
      if (this.shouldApplyFixes()) {
        output = this.applyFixes(source, mergedResult);
      }

      // Convert to LintResult format, using effectivePath for reporting
      const lintResult = buildLintResult(
        effectivePath,
        mergedResult,
        source,
        output,
        Date.now() - fileStartTime
      );

      return lintResult;
    } catch (error) {
      // Validation error or other unexpected error
      const { createFileReadError } = await import('./message-builder');
      const errorMessage = createFileReadError(effectivePath, error as Error);

      return {
        filePath: effectivePath,
        messages: [errorMessage],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        source,
      };
    }
  }

  /**
   * Check if fixes should be applied based on the fix option
   */
  private shouldApplyFixes(): boolean {
    return this.options.fix !== undefined && this.options.fix !== false;
  }

  /**
   * Apply all automatic fixes to the source content
   *
   * @param source - Original source content
   * @param validationResult - Validation result containing errors/warnings with AutoFix objects
   * @returns Fixed content, or undefined if no fixes were applied
   */
  private applyFixes(
    source: string,
    validationResult: import('../validators/file-validator').ValidationResult
  ): string | undefined {
    // Collect all AutoFix objects from errors and warnings
    const autoFixes: import('../validators/file-validator').AutoFix[] = [];

    for (const error of validationResult.errors) {
      if (error.autoFix) {
        // Check if this fix should be applied (if fix is a predicate function)
        if (typeof this.options.fix === 'function') {
          // Convert to LintMessage to check predicate
          const lintMessage = buildLintMessage(error, 'error');
          if (this.options.fix(lintMessage)) {
            autoFixes.push(error.autoFix);
          }
        } else {
          autoFixes.push(error.autoFix);
        }
      }
    }

    for (const warning of validationResult.warnings) {
      if (warning.autoFix) {
        // Check if this fix should be applied (if fix is a predicate function)
        if (typeof this.options.fix === 'function') {
          // Convert to LintMessage to check predicate
          const lintMessage = buildLintMessage(warning, 'warning');
          if (this.options.fix(lintMessage)) {
            autoFixes.push(warning.autoFix);
          }
        } else {
          autoFixes.push(warning.autoFix);
        }
      }
    }

    // If no fixes, return undefined
    if (autoFixes.length === 0) {
      return undefined;
    }

    // Apply all fixes sequentially
    let fixedContent = source;
    for (const autoFix of autoFixes) {
      fixedContent = autoFix.apply(fixedContent);
    }

    // Return fixed content only if it's different from source
    return fixedContent !== source ? fixedContent : undefined;
  }

  /**
   * Merge multiple ValidationResult objects into one
   */
  private mergeValidationResults(
    results: import('../validators/file-validator').ValidationResult[]
  ): import('../validators/file-validator').ValidationResult {
    const mergedErrors: import('../validators/file-validator').ValidationError[] = [];
    const mergedWarnings: import('../validators/file-validator').ValidationWarning[] = [];
    let allValid = true;

    for (const result of results) {
      if (!result.valid) {
        allValid = false;
      }
      mergedErrors.push(...result.errors);
      mergedWarnings.push(...result.warnings);
    }

    return {
      valid: allValid,
      errors: mergedErrors,
      warnings: mergedWarnings,
    };
  }
}
