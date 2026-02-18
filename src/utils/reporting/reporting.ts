import chalk from 'chalk';
import { relative } from 'path';
import table from 'text-table';
import {
  ValidationError,
  ValidationWarning,
  ValidationResult,
  DeprecatedRuleUsage,
} from '../../validators/file-validator';
import { ProgressIndicator } from './progress';
import { ValidationCache } from '../cache';
import { ConfigError } from '../config/resolver';
import { toSarif } from './sarif';
import { toGitHub } from './github';

/**
 * Output format for validation results
 */
export type OutputFormat = 'stylish' | 'json' | 'compact' | 'sarif' | 'github';

/**
 * Configuration options for Reporter
 */
export interface ReportingOptions {
  /** Enable verbose output with additional details */
  verbose?: boolean;
  /** Suppress warnings, show only errors */
  quiet?: boolean;
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
  /** Show warnings about deprecated rules (default: true) */
  deprecatedWarnings?: boolean;
  /** Treat deprecated rule usage as errors (default: false) */
  errorOnDeprecated?: boolean;
  /** Collapse repetitive same-rule issues into "... and N more" (default: true) */
  collapseRepetitive?: boolean;
}

/**
 * Formats and displays validation results to the console
 *
 * IMPORTANT: All console output MUST use the helper methods (log, detail, subDetail, newline).
 * Direct console.log calls with manual spacing are not allowed.
 *
 * Output streams:
 * - Result data (errors, warnings, summaries) → stdout via log/detail/subDetail/newline
 * - Status messages (validator progress) → stderr via writeStatus()
 * - JSON/SARIF formatted output → stdout via console.log()
 *
 * This separation enables clean piping: `claudelint --format json | jq`
 *
 * Output helpers:
 * - this.log(msg) - Plain output to stdout, no indentation
 * - this.detail(msg) - Indented 2 spaces to stdout
 * - this.subDetail(msg) - Indented 4 spaces to stdout (nested detail)
 * - this.newline() - Blank line to stdout
 * - this.writeStatus(msg) - Status message to stderr
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
    // Auto-detect color support (NO_COLOR wins over FORCE_COLOR per spec)
    if (this.options.color === undefined) {
      if (process.env.NO_COLOR) {
        this.options.color = false;
      } else if (process.env.FORCE_COLOR) {
        this.options.color = true;
      } else {
        this.options.color = !!process.stdout.isTTY;
      }
    }
    // Set chalk color level
    if (this.options.color) {
      chalk.level = 1; // Force basic color support
    } else {
      chalk.level = 0; // Disable colors
    }
    // Initialize progress indicator (disabled for machine-readable formats)
    this.progressIndicator = new ProgressIndicator({
      enabled: !this.isMachineFormat(),
    });
  }

  /**
   * Check if current format is machine-readable (no human chrome)
   */
  private isMachineFormat(): boolean {
    const f = this.options.format;
    return f === 'json' || f === 'sarif' || f === 'github';
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
      const cached = cache.get(name, config);
      if (cached) {
        const duration = Date.now() - startTime;
        return { name, result: cached, duration };
      }
    }

    // Run validation with exception handling
    try {
      const result = await validatorFn();
      const duration = Date.now() - startTime;

      // Store in cache (if provided) — file fingerprints come from result.validatedFiles
      if (cache) {
        cache.set(name, result, config);
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
   *
   * Quiet success: In non-verbose mode, per-validator output is suppressed
   * for clean validators. Only validators with issues are shown. The caller
   * (check-all) always prints a summary line, so clean runs get a single line.
   */
  reportParallelResults(
    results: Array<{ name: string; id?: string; result: ValidationResult; duration: number }>
  ): void {
    // Report each validator's results
    for (const { name, id, result, duration } of results) {
      // Store results for JSON output
      this.allResults.push({ validator: name, result });

      if (!this.isMachineFormat()) {
        // In quiet mode, only errors count as issues (warnings are suppressed)
        const hasIssues = this.options.quiet
          ? result.errors.length > 0
          : result.errors.length > 0 || result.warnings.length > 0;

        // Only show per-validator detail when there are issues to report.
        // Clean validators are covered by the component status section (verbose)
        // or the summary line (normal mode).
        if (hasIssues) {
          const label = id || name;
          this.writeStatus('');
          this.writeStatus(`${label} (${duration}ms)`);
          this.reportResult(result, name);
        }
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
   * Report all results in SARIF format (call this at the end)
   */
  reportAllSARIF(version?: string): void {
    console.log(toSarif(this.allResults, version));
  }

  /**
   * Report all results in GitHub Actions annotation format (call this at the end)
   */
  reportAllGitHub(): void {
    const output = toGitHub(this.allResults);
    if (output) {
      console.log(output);
    }
  }

  /**
   * Get formatted output as a string (for --output-file)
   *
   * Supports JSON, SARIF, and GitHub formats. Returns null for
   * stylish/compact formats which output incrementally.
   */
  getFormattedOutputString(): string | null {
    const format = this.options.format || 'stylish';
    if (format === 'json') {
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
      return JSON.stringify(output, null, 2);
    }
    if (format === 'sarif') {
      return toSarif(this.allResults);
    }
    if (format === 'github') {
      return toGitHub(this.allResults) || '';
    }
    // stylish/compact formats write incrementally — not supported for file output
    return null;
  }

  /**
   * Report in stylish format (default) — ESLint-style file grouping with text-table alignment
   */
  private reportStylish(result: ValidationResult, _validatorName: string): void {
    // Collect all visible issues into a unified list
    type Issue = (ValidationError | ValidationWarning) & { kind: 'error' | 'warning' };
    const issues: Issue[] = [];

    for (const error of result.errors) {
      issues.push({ ...error, kind: 'error' });
    }
    if (!this.options.quiet) {
      for (const warning of result.warnings) {
        issues.push({ ...warning, kind: 'warning' });
      }
    }

    if (issues.length === 0) {
      this.writeStatus(this.colorize(chalk.green, '✓ All checks passed!'));
      // Deprecation warnings (if enabled)
      if (this.options.deprecatedWarnings !== false && result.deprecatedRulesUsed) {
        this.reportDeprecatedRules(result.deprecatedRulesUsed);
      }
      return;
    }

    // Deduplicate identical issues
    const seen = new Set<string>();
    const deduped: Issue[] = [];
    for (const issue of issues) {
      const key = `${issue.file || ''}:${issue.line || ''}:${issue.ruleId || ''}:${issue.message}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(issue);
      }
    }

    // Group issues by file path
    const cwd = process.cwd();
    const groups = new Map<string, Issue[]>();
    for (const issue of deduped) {
      const key = issue.file || '';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(issue);
    }

    const isExplainMode = this.options.explain === true;

    // Compute global max line number width for consistent column alignment across file groups
    const maxLineWidth = Math.max(1, ...deduped.map((issue) => String(issue.line || 0).length));

    // Render each file group using text-table for column alignment
    for (const [filePath, fileIssues] of groups) {
      this.newline();
      if (filePath) {
        const rel = relative(cwd, filePath) || filePath;
        // Count errors and warnings for this file
        const errCount = fileIssues.filter((i) => i.kind === 'error').length;
        const warnCount = fileIssues.filter((i) => i.kind === 'warning').length;
        const counts: string[] = [];
        if (errCount > 0) counts.push(`${errCount} error${errCount !== 1 ? 's' : ''}`);
        if (warnCount > 0) counts.push(`${warnCount} warning${warnCount !== 1 ? 's' : ''}`);
        const countSuffix = counts.length > 0 ? ` (${counts.join(', ')})` : '';
        this.log(this.colorize(chalk.underline, rel) + this.colorize(chalk.dim, countSuffix));
      }

      // Track per-ruleId counts for collapsing repetitive warnings
      const ruleIdCounts = new Map<string, number>();
      for (const issue of fileIssues) {
        if (issue.ruleId) {
          ruleIdCounts.set(issue.ruleId, (ruleIdCounts.get(issue.ruleId) || 0) + 1);
        }
      }
      const ruleIdShown = new Map<string, number>();

      // Build table rows (plain strings — colors applied after table generation)
      // Columns: [indent, lineNum, severity, message] — rule ID appended separately with fixed gap
      const rows: string[][] = [];
      const rowRuleIds: string[] = [];
      // Track metadata for each row (for coloring and explain-mode content)
      const rowMeta: Array<{
        kind: 'issue' | 'collapse';
        issue?: Issue;
        severityKind?: 'error' | 'warning';
      }> = [];

      for (const issue of fileIssues) {
        // Collapse: when 3+ issues share the same ruleId, show first 2 then a summary
        if (this.options.collapseRepetitive !== false && issue.ruleId) {
          const count = ruleIdCounts.get(issue.ruleId) || 0;
          const shown = ruleIdShown.get(issue.ruleId) || 0;
          if (count >= 3 && shown >= 2) {
            if (shown === 2) {
              const remaining = count - 2;
              rows.push(['', '', '', `... and ${remaining} more ${issue.ruleId}`]);
              rowRuleIds.push('');
              rowMeta.push({ kind: 'collapse' });
            }
            ruleIdShown.set(issue.ruleId, shown + 1);
            continue;
          }
          ruleIdShown.set(issue.ruleId, shown + 1);
        }

        // Truncate long messages to keep the table readable
        const maxMsgLen = 80;
        const msg =
          issue.message.length > maxMsgLen
            ? issue.message.slice(0, maxMsgLen - 3) + '...'
            : issue.message;

        const lineStr = String(issue.line || 0).padStart(maxLineWidth);
        rows.push(['', lineStr, issue.kind, msg]);
        rowRuleIds.push(issue.ruleId || '');
        rowMeta.push({ kind: 'issue', issue, severityKind: issue.kind });
      }

      if (rows.length === 0) continue;

      // Generate aligned table for the first 4 columns (plain strings — no ANSI codes)
      const tableOutput = table(rows, {
        align: ['l', 'r', 'l', 'l'],
      });

      // Output each line with colors and rule ID appended with fixed 2-space gap
      const tableLines = tableOutput.split('\n');
      for (let i = 0; i < tableLines.length; i++) {
        let line = tableLines[i];
        const meta = rowMeta[i];
        const ruleId = rowRuleIds[i] || '';

        if (!meta) {
          this.log(line);
          continue;
        }

        if (meta.kind === 'collapse') {
          this.log(this.colorize(chalk.gray, line));
        } else {
          // Apply severity color
          if (meta.severityKind === 'error') {
            line = line.replace(/\berror\b/, this.colorize(chalk.red, 'error'));
          } else {
            line = line.replace(/\bwarning\b/, this.colorize(chalk.yellow, 'warning'));
          }

          // Append rule ID with fixed 2-space gap (not padded to widest message)
          if (ruleId) {
            line = line.trimEnd() + '  ' + this.colorize(chalk.dim, ruleId);
          }

          this.log(line);

          // Show docs URL if enabled
          if (this.options.showDocsUrl && meta.issue?.ruleId) {
            const docsUrl = this.getDocsUrl(meta.issue.ruleId);
            if (docsUrl) {
              this.subDetail(this.colorize(chalk.blue, `Docs: ${docsUrl}`));
            }
          }

          // Show explanations in explain mode only (Tier 2: Why + Fix)
          if (isExplainMode && meta.issue) {
            const iss = meta.issue;
            if (iss.explanation) {
              this.log(
                `        ${this.colorize(chalk.cyan, 'Why:')} ${this.colorize(chalk.gray, iss.explanation)}`
              );
            }
            // Fix priority: issue.fix (rule-specific) > issue.howToFix (from docs.howToFix)
            const fixText = iss.fix || iss.howToFix;
            if (fixText) {
              const fixLines = fixText.split('\n');
              this.log(
                `        ${this.colorize(chalk.cyan, 'Fix:')} ${this.colorize(chalk.gray, fixLines[0])}`
              );
              for (let j = 1; j < fixLines.length; j++) {
                this.log(`             ${this.colorize(chalk.gray, fixLines[j])}`);
              }
            }
          }
        }
      }
    }

    // Deprecation warnings (if enabled)
    if (this.options.deprecatedWarnings !== false && result.deprecatedRulesUsed) {
      this.reportDeprecatedRules(result.deprecatedRulesUsed);
    }
  }

  /**
   * Report in compact format (one line per issue)
   */
  private reportCompact(result: ValidationResult, validatorName: string): void {
    const cwd = process.cwd();
    const relPath = (file?: string) => (file ? relative(cwd, file) || file : validatorName);

    result.errors.forEach((error) => {
      const location = relPath(error.file);
      const line = error.line || 0;
      const ruleId = error.ruleId || 'unknown';
      console.log(`${location}:${line}:0: error: ${error.message} [${ruleId}]`);
    });

    // Suppress warnings in quiet mode
    if (!this.options.quiet) {
      result.warnings.forEach((warning) => {
        const location = relPath(warning.file);
        const line = warning.line || 0;
        const ruleId = warning.ruleId || 'unknown';
        console.log(`${location}:${line}:0: warning: ${warning.message} [${ruleId}]`);
      });
    }
  }

  /**
   * Colorize text if color is enabled
   */
  private colorize(chalkFn: (text: string) => string, text: string): string {
    return this.options.color ? chalkFn(text) : text;
  }

  /**
   * Output helper - status message to stderr
   * Used for validator progress, not result data
   */
  private writeStatus(msg: string): void {
    console.error(msg);
  }

  /**
   * Output helper - plain message to stdout
   */
  private log(msg: string): void {
    console.log(msg);
  }

  /**
   * Output helper - indented detail (2 spaces)
   */
  private detail(msg: string): void {
    console.log(`  ${msg}`);
  }

  /**
   * Output helper - nested detail (4 spaces)
   */
  private subDetail(msg: string): void {
    console.log(`    ${msg}`);
  }

  /**
   * Output helper - blank line
   */
  private newline(): void {
    console.log();
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

    const baseUrl = 'https://claudelint.com/rules';
    return `${baseUrl}/${category}/${ruleId}`;
  }

  /**
   * Report deprecated rules that were used during validation
   */
  private reportDeprecatedRules(deprecatedRules: DeprecatedRuleUsage[]): void {
    if (deprecatedRules.length === 0) {
      return;
    }

    this.newline();
    this.log(this.colorize(chalk.yellow, 'Deprecated rules used:'));
    this.newline();

    for (const rule of deprecatedRules) {
      // Main deprecation message
      const ruleId = this.colorize(chalk.bold, rule.ruleId);
      const reason = this.colorize(chalk.gray, rule.reason);
      this.detail(`${ruleId}: ${reason}`);

      // Replacement information
      if (rule.replacedBy && rule.replacedBy.length > 0) {
        const replacements = rule.replacedBy.join(', ');
        this.subDetail(this.colorize(chalk.cyan, `Use ${replacements} instead`));
      }

      // Removal version
      if (rule.removeInVersion) {
        this.subDetail(this.colorize(chalk.red, `Will be removed in ${rule.removeInVersion}`));
      }

      // Migration guide
      if (rule.url) {
        this.subDetail(this.colorize(chalk.blue, `Migration guide: ${rule.url}`));
      }

      this.newline();
    }
  }

  /**
   * Get the explain mode footer hint (Tier 2 → Tier 3 pointer).
   * Returns the hint string if explain mode is enabled, null otherwise.
   * Caller should print this after the summary line.
   */
  getExplainFooter(): string | null {
    if (!this.options.explain) return null;
    return this.colorize(
      chalk.gray,
      "Run 'claudelint explain <rule-id>' for detailed rule documentation."
    );
  }

  /**
   * Get appropriate exit code based on validation result
   */
  getExitCode(result: ValidationResult): number {
    // Check if deprecated rules should be treated as errors
    if (
      this.options.errorOnDeprecated &&
      result.deprecatedRulesUsed &&
      result.deprecatedRulesUsed.length > 0
    ) {
      return 1; // Deprecated rules treated as errors
    }

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
      this.detail(chalk.gray(message));
    }
  }

  /**
   * Report section header
   */
  section(title: string): void {
    if (this.options.verbose) {
      this.newline();
      this.log(chalk.blue(title));
    }
  }

  /**
   * Report success message
   */
  success(message: string): void {
    if (this.options.verbose) {
      this.detail(chalk.green(`✓ ${message}`));
    }
  }
}
