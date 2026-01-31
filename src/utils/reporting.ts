import chalk from 'chalk';
import { ValidationError, ValidationWarning, ValidationResult } from '../validators/base';
import { ProgressIndicator } from './progress';
import { ValidationCache } from './cache';
import { ConfigError } from './config-resolver';

/**
 * Output format for validation results
 */
export type OutputFormat = 'stylish' | 'json' | 'compact';

/**
 * Configuration options for Reporter
 */
export interface ReportingOptions {
  /** Enable verbose output with additional details */
  verbose?: boolean;
  /** Treat warnings as errors (affects exit codes) */
  warningsAsErrors?: boolean;
  /** Show detailed explanations for each issue */
  explain?: boolean;
  /** Output format (stylish, json, or compact) */
  format?: OutputFormat;
  /** Enable colored output (auto-detected if not specified) */
  color?: boolean;
  /** Show documentation URLs for rules */
  showDocsUrl?: boolean;
}

/**
 * Formats and displays validation results to the console
 *
 * @example
 * ```typescript
 * const reporter = new Reporter({ format: 'stylish', color: true });
 * reporter.report(validationResult, 'CLAUDE.md');
 * const exitCode = reporter.getExitCode(validationResult);
 * ```
 */
export class Reporter {
  private options: ReportingOptions;
  private allResults: Array<{ validator: string; result: ValidationResult }> = [];
  private progressIndicator: ProgressIndicator;
  private currentSection: { name: string; startTime: number } | null = null;

  /**
   * Creates a new Reporter instance
   * @param options - Reporting configuration options
   */
  constructor(options: ReportingOptions = {}) {
    this.options = options;
    // Auto-detect color support
    if (this.options.color === undefined) {
      this.options.color = process.stdout.isTTY && !process.env.NO_COLOR;
    }
    // Set chalk color level
    if (this.options.color) {
      chalk.level = 1; // Force basic color support
    } else {
      chalk.level = 0; // Disable colors
    }
    // Initialize progress indicator
    this.progressIndicator = new ProgressIndicator({
      enabled: this.options.format !== 'json',
    });
  }

  /**
   * Start a validation section with progress indicator
   */
  startSection(name: string, fileCount?: number): void {
    const message = fileCount
      ? `Validating ${name} (${fileCount} files)...`
      : `Validating ${name}...`;
    this.progressIndicator.start(message);
    this.currentSection = { name, startTime: Date.now() };
  }

  /**
   * End a validation section with timing
   */
  endSection(): void {
    if (this.currentSection) {
      const duration = Date.now() - this.currentSection.startTime;
      const message = `Validated ${this.currentSection.name}`;
      this.progressIndicator.succeed(message, duration);
      this.currentSection = null;
    }
  }

  /**
   * Run a validator with timing (for parallel execution)
   * Returns result and duration without reporting (to avoid conflicts with concurrent runs)
   */
  async runValidator(
    name: string,
    validatorFn: () => Promise<ValidationResult>,
    cache?: ValidationCache | null,
    config?: unknown
  ): Promise<{ name: string; result: ValidationResult; duration: number }> {
    const startTime = Date.now();

    // Try cache first (if provided)
    if (cache) {
      const cached = cache.get(name, [], config);
      if (cached) {
        const duration = Date.now() - startTime;
        return { name, result: cached, duration };
      }
    }

    // Run validation with exception handling
    try {
      const result = await validatorFn();
      const duration = Date.now() - startTime;

      // Store in cache (if provided)
      if (cache) {
        cache.set(name, result, [], config);
      }

      return { name, result, duration };
    } catch (error) {
      // Re-throw configuration errors - these are fatal and should exit with code 2
      if (error instanceof ConfigError) {
        throw error;
      }

      // Validator threw an exception (operational error, not validation issue)
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Return a ValidationResult with the exception as an error
      const result: ValidationResult = {
        valid: false,
        errors: [
          {
            message: `Validator failed: ${errorMessage}`,
            severity: 'error',
          },
        ],
        warnings: [],
      };

      return { name, result, duration };
    }
  }

  /**
   * Report results after parallel validation
   */
  reportParallelResults(
    results: Array<{ name: string; result: ValidationResult; duration: number }>
  ): void {
    // Report each validator's results
    for (const { name, result, duration } of results) {
      // Store results for JSON output
      this.allResults.push({ validator: name, result });

      if (this.options.format !== 'json') {
        console.log(`\n✓ ${name} (${duration}ms)`);
        this.reportResult(result, name);
      }
    }
  }

  /**
   * Report a single result (extracted for reuse)
   */
  private reportResult(result: ValidationResult, validatorName: string): void {
    const format = this.options.format || 'stylish';

    if (format === 'stylish') {
      this.reportStylish(result, validatorName);
    } else if (format === 'compact') {
      this.reportCompact(result, validatorName);
    }
    // JSON format handled separately via reportAllJSON()
  }

  /**
   * Report a validation result to the console
   */
  report(result: ValidationResult, validatorName: string): void {
    // Store results for later formatting (e.g., JSON output at the end)
    this.allResults.push({ validator: validatorName, result });

    const format = this.options.format || 'stylish';

    if (format === 'stylish') {
      this.reportStylish(result, validatorName);
    } else if (format === 'compact') {
      this.reportCompact(result, validatorName);
    }
    // JSON format is handled in reportAllJSON() at the end
  }

  /**
   * Report all results in JSON format (call this at the end)
   */
  reportAllJSON(): void {
    const output = {
      valid: this.allResults.every((r) => r.result.valid),
      errorCount: this.allResults.reduce((sum, r) => sum + r.result.errors.length, 0),
      warningCount: this.allResults.reduce((sum, r) => sum + r.result.warnings.length, 0),
      validators: this.allResults.map((r) => ({
        name: r.validator,
        valid: r.result.valid,
        errors: r.result.errors,
        warnings: r.result.warnings,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
  }

  /**
   * Report in stylish format (default)
   */
  private reportStylish(result: ValidationResult, validatorName: string): void {
    if (this.options.verbose) {
      console.log(this.colorize(chalk.blue, `\n${validatorName} Validation Results:\n`));
    }

    // Report errors
    if (result.errors.length > 0) {
      result.errors.forEach((error) => this.reportError(error));
    }

    // Report warnings
    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => this.reportWarning(warning));
    }

    // Summary
    const totalIssues = result.errors.length + result.warnings.length;
    if (totalIssues === 0) {
      console.log(this.colorize(chalk.green, '✓ All checks passed!'));
    } else {
      console.log();
      this.reportSummary(result.errors.length, result.warnings.length);
    }
  }

  /**
   * Report in compact format (one line per issue)
   */
  private reportCompact(result: ValidationResult, validatorName: string): void {
    result.errors.forEach((error) => {
      const location = error.file || validatorName;
      const line = error.line || 0;
      const ruleId = error.ruleId || 'unknown';
      console.log(`${location}:${line}:0: error: ${error.message} [${ruleId}]`);
    });

    result.warnings.forEach((warning) => {
      const location = warning.file || validatorName;
      const line = warning.line || 0;
      const ruleId = warning.ruleId || 'unknown';
      console.log(`${location}:${line}:0: warning: ${warning.message} [${ruleId}]`);
    });
  }

  /**
   * Colorize text if color is enabled
   */
  private colorize(chalkFn: (text: string) => string, text: string): string {
    return this.options.color ? chalkFn(text) : text;
  }

  /**
   * Report a single error
   */
  private reportError(error: ValidationError): void {
    const location = this.formatLocation(error.file, error.line);
    const ruleId = error.ruleId ? this.colorize(chalk.gray, `[${error.ruleId}]`) : '';
    console.log(
      this.colorize(chalk.red, `✗ Error: ${error.message}`) + (ruleId ? ` ${ruleId}` : '')
    );
    if (location) {
      console.log(this.colorize(chalk.gray, `  at: ${location}`));
    }

    // Show documentation URL if enabled and rule ID is available
    if (this.options.showDocsUrl && error.ruleId) {
      const docsUrl = this.getDocsUrl(error.ruleId);
      if (docsUrl) {
        console.log(this.colorize(chalk.blue, `  → Docs: ${docsUrl}`));
      }
    }

    // Show detailed information if --explain is set or if info is available
    if (this.options.explain || this.options.verbose) {
      if (error.explanation) {
        console.log(this.colorize(chalk.cyan, '  Why this matters:'));
        console.log(this.colorize(chalk.gray, `  ${error.explanation}`));
      }
      if (error.howToFix) {
        console.log(this.colorize(chalk.cyan, '  How to fix:'));
        error.howToFix.split('\n').forEach((line) => {
          console.log(this.colorize(chalk.gray, `  ${line}`));
        });
      }
      if (error.fix) {
        console.log(this.colorize(chalk.green, '  Fix: ') + this.colorize(chalk.white, error.fix));
      }
      console.log(); // Add spacing
    } else if (error.fix) {
      // Show quick fix even without --explain
      console.log(this.colorize(chalk.gray, `  Fix: ${error.fix}`));
    }
  }

  /**
   * Report a single warning
   */
  private reportWarning(warning: ValidationWarning): void {
    const location = this.formatLocation(warning.file, warning.line);
    const ruleId = warning.ruleId ? this.colorize(chalk.gray, `[${warning.ruleId}]`) : '';
    console.log(
      this.colorize(chalk.yellow, `! Warning: ${warning.message}`) + (ruleId ? ` ${ruleId}` : '')
    );
    if (location) {
      console.log(this.colorize(chalk.gray, `  at: ${location}`));
    }

    // Show documentation URL if enabled and rule ID is available
    if (this.options.showDocsUrl && warning.ruleId) {
      const docsUrl = this.getDocsUrl(warning.ruleId);
      if (docsUrl) {
        console.log(this.colorize(chalk.blue, `  → Docs: ${docsUrl}`));
      }
    }

    // Show detailed information if --explain is set or if info is available
    if (this.options.explain || this.options.verbose) {
      if (warning.explanation) {
        console.log(this.colorize(chalk.cyan, '  Why this matters:'));
        console.log(this.colorize(chalk.gray, `  ${warning.explanation}`));
      }
      if (warning.howToFix) {
        console.log(this.colorize(chalk.cyan, '  How to fix:'));
        warning.howToFix.split('\n').forEach((line) => {
          console.log(this.colorize(chalk.gray, `  ${line}`));
        });
      }
      if (warning.fix) {
        console.log(
          this.colorize(chalk.green, '  Fix: ') + this.colorize(chalk.white, warning.fix)
        );
      }
      console.log(); // Add spacing
    } else if (warning.fix) {
      // Show quick fix even without --explain
      console.log(this.colorize(chalk.gray, `  Fix: ${warning.fix}`));
    }
  }

  /**
   * Report summary of errors and warnings
   */
  private reportSummary(errorCount: number, warningCount: number): void {
    const parts: string[] = [];

    if (errorCount > 0) {
      parts.push(this.colorize(chalk.red, `${errorCount} error${errorCount === 1 ? '' : 's'}`));
    }

    if (warningCount > 0) {
      parts.push(
        this.colorize(chalk.yellow, `${warningCount} warning${warningCount === 1 ? '' : 's'}`)
      );
    }

    console.log(parts.join(', '));
  }

  /**
   * Format file location for display
   */
  private formatLocation(file?: string, line?: number): string | null {
    if (!file) {
      return null;
    }
    return line ? `${file}:${line}` : file;
  }

  /**
   * Get documentation URL for a rule
   */
  private getDocsUrl(ruleId: string): string | null {
    if (!ruleId) {
      return null;
    }

    // Map rule ID to category
    const categoryMap: Record<string, string> = {
      'size-error': 'claude-md',
      'size-warning': 'claude-md',
      'import-missing': 'claude-md',
      'import-circular': 'claude-md',
      'skill-missing-shebang': 'skills',
      'skill-missing-changelog': 'skills',
      'skill-missing-version': 'skills',
      'skill-missing-comments': 'skills',
      'skill-dangerous-command': 'skills',
      'skill-eval-usage': 'skills',
      'skill-path-traversal': 'skills',
      'skill-missing-examples': 'skills',
      'skill-too-many-files': 'skills',
      'skill-deep-nesting': 'skills',
      'skill-naming-inconsistent': 'skills',
      'settings-invalid-schema': 'settings',
      'settings-invalid-permission': 'settings',
      'settings-invalid-env-var': 'settings',
      'hooks-invalid-event': 'hooks',
      'hooks-missing-script': 'hooks',
      'hooks-invalid-config': 'hooks',
      'mcp-invalid-server': 'mcp',
      'mcp-invalid-transport': 'mcp',
      'mcp-invalid-env-var': 'mcp',
      'plugin-invalid-manifest': 'plugin',
      'plugin-invalid-version': 'plugin',
      'plugin-missing-file': 'plugin',
    };

    const category = categoryMap[ruleId];
    if (!category) {
      return null;
    }

    // Use repository base URL (can be configured later)
    const baseUrl = 'https://github.com/patd/claude-code-lint/blob/main/docs/rules';
    return `${baseUrl}/${category}/${ruleId}.md`;
  }

  /**
   * Get appropriate exit code based on validation result
   */
  getExitCode(result: ValidationResult): number {
    if (result.errors.length > 0 || (result.warnings.length > 0 && this.options.warningsAsErrors)) {
      return 1; // Errors or warnings-as-errors
    }
    if (result.warnings.length > 0) {
      return 1; // Warnings
    }
    return 0; // Success
  }

  /**
   * Report verbose progress message
   */
  progress(message: string): void {
    if (this.options.verbose) {
      console.log(chalk.gray(`  ${message}`));
    }
  }

  /**
   * Report section header
   */
  section(title: string): void {
    if (this.options.verbose) {
      console.log(chalk.blue(`\n${title}`));
    }
  }

  /**
   * Report success message
   */
  success(message: string): void {
    if (this.options.verbose) {
      console.log(chalk.green(`  ✓ ${message}`));
    }
  }
}
