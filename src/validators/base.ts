// Base validator class that all validators extend

import * as fs from 'fs/promises';
import { Dirent } from 'fs';
import * as path from 'path';
import { readFileContent } from '../utils/file-system';
import { VALID_TOOLS, VALID_HOOK_EVENTS } from '../schemas/constants';
import { ClaudeLintConfig } from '../utils/config';
import { formatError } from '../utils/validation-helpers';
import { RuleId } from '../rules/rule-ids';
import { RuleCategory } from '../types/rule';
import { ConfigResolver } from '../utils/config-resolver';
import { RuleRegistry } from '../utils/rule-registry';
import { validateFrontmatterWithSchema } from '../utils/schema-helpers';
import { z } from 'zod';

/**
 * Automatic fix that can be applied to resolve a validation issue
 */
export interface AutoFix {
  /** Unique identifier for the rule that provides this fix */
  ruleId: RuleId;
  /** Human-readable description of what the fix does */
  description: string;
  /** The file path to fix */
  filePath: string;
  /** Function that applies the fix and returns the new file content */
  apply: (currentContent: string) => string;
}

/**
 * Represents a validation issue before severity is applied
 */
export interface ValidationIssue {
  /** Issue message describing the problem */
  message: string;
  /** File path where the issue occurred */
  file?: string;
  /** Line number where the issue occurred */
  line?: number;
  /** Unique identifier for the rule that triggered this issue (required for config support) */
  ruleId?: RuleId;
  /** Default severity (only used when ruleId is undefined, for backward compatibility) */
  defaultSeverity?: 'error' | 'warning';
  /** Quick fix suggestion text */
  fix?: string;
  /** Detailed explanation of why this issue matters */
  explanation?: string;
  /** Step-by-step instructions on how to fix the issue */
  howToFix?: string;
  /** Automatic fix that can be applied */
  autoFix?: AutoFix;
}

/**
 * Represents a validation error with location and fix information
 */
export interface ValidationError {
  /** Error message describing the issue */
  message: string;
  /** File path where the error occurred */
  file?: string;
  /** Line number where the error occurred */
  line?: number;
  /** Severity level (always 'error' for this interface) */
  severity: 'error';
  /** Unique identifier for the rule that triggered this error */
  ruleId?: RuleId;
  /** Quick fix suggestion text */
  fix?: string;
  /** Detailed explanation of why this issue matters */
  explanation?: string;
  /** Step-by-step instructions on how to fix the issue */
  howToFix?: string;
  /** Automatic fix that can be applied */
  autoFix?: AutoFix;
}

/**
 * Represents a validation warning with location and fix information
 */
export interface ValidationWarning {
  /** Warning message describing the issue */
  message: string;
  /** File path where the warning occurred */
  file?: string;
  /** Line number where the warning occurred */
  line?: number;
  /** Severity level (always 'warning' for this interface) */
  severity: 'warning';
  /** Unique identifier for the rule that triggered this warning */
  ruleId?: RuleId;
  /** Quick fix suggestion text */
  fix?: string;
  /** Detailed explanation of why this issue matters */
  explanation?: string;
  /** Step-by-step instructions on how to fix the issue */
  howToFix?: string;
  /** Automatic fix that can be applied */
  autoFix?: AutoFix;
}

/**
 * Result of a validation operation containing errors and warnings
 */
export interface ValidationResult {
  /** Whether validation passed (no errors or warnings) */
  valid: boolean;
  /** List of validation errors found */
  errors: ValidationError[];
  /** List of validation warnings found */
  warnings: ValidationWarning[];
}

/**
 * Base configuration options shared by all validators
 */
export interface BaseValidatorOptions {
  /** Custom path to validate (overrides default discovery) */
  path?: string;
  /** Enable verbose output with additional details */
  verbose?: boolean;
  /** Treat warnings as errors (fail build on warnings) */
  warningsAsErrors?: boolean;
  /** Configuration object */
  config?: ClaudeLintConfig;
}

/**
 * Legacy alias for backwards compatibility
 * @deprecated Use BaseValidatorOptions or specific validator options instead
 */
export type ValidatorOptions = BaseValidatorOptions;

interface DisabledRule {
  ruleId: string; // Can be RuleId, 'all', or invalid rule IDs from comments
  startLine?: number;
  endLine?: number;
  used?: boolean;
  commentLine?: number; // Line where the disable comment appears
}

/**
 * Base class for all validators providing common validation functionality
 *
 * @example
 * ```typescript
 * class MyValidator extends BaseValidator {
 *   async validate(): Promise<ValidationResult> {
 *     this.report('Error message', 'file.md', 10, 'rule-id');
 *     return this.getResult();
 *   }
 * }
 * ```
 */
export abstract class BaseValidator {
  protected options: BaseValidatorOptions;
  protected issues: ValidationIssue[] = [];
  protected disabledRules: Map<string, DisabledRule[]> = new Map(); // file path -> disabled rules

  /** Config resolver for accessing rule configuration */
  protected configResolver?: ConfigResolver;

  /** Current file being validated (for config resolution) */
  protected currentFile?: string;

  /**
   * Creates a new validator instance
   * @param options - Validation options
   */
  constructor(options: BaseValidatorOptions = {}) {
    this.options = options;

    // Initialize config resolver if config is provided
    if (options.config) {
      this.configResolver = new ConfigResolver(options.config);
    }
  }

  /**
   * Performs validation and returns results
   * @returns Promise resolving to validation results
   */
  abstract validate(): Promise<ValidationResult>;

  /**
   * Merge schema validation results into this validator
   *
   * Converts pre-classified errors/warnings from schema validation into issues.
   * Severity will be determined by config in getResult().
   *
   * @param result - Validation result from schema validation
   *
   * @example
   * ```typescript
   * const result = validateFrontmatterWithSchema(content, schema, filePath, 'claude-md');
   * this.mergeSchemaValidationResult(result);
   * ```
   */
  protected mergeSchemaValidationResult(result: ValidationResult): void {
    // Convert errors to issues
    for (const error of result.errors) {
      if (error.ruleId) {
        this.issues.push({
          message: error.message,
          file: error.file,
          line: error.line,
          ruleId: error.ruleId,
          fix: error.fix,
          explanation: error.explanation,
          howToFix: error.howToFix,
          autoFix: error.autoFix,
        });
      }
    }

    // Convert warnings to issues
    for (const warning of result.warnings) {
      if (warning.ruleId) {
        this.issues.push({
          message: warning.message,
          file: warning.file,
          line: warning.line,
          ruleId: warning.ruleId,
          fix: warning.fix,
          explanation: warning.explanation,
          howToFix: warning.howToFix,
          autoFix: warning.autoFix,
        });
      }
    }
  }

  /**
   * Report a validation issue
   *
   * Severity is determined by configuration, not hardcoded.
   *
   * @param message - Issue message describing the problem
   * @param file - File path where the issue occurred
   * @param line - Line number where the issue occurred
   * @param ruleId - Unique identifier for the rule
   * @param options - Additional issue information (fix, explanation, etc.)
   *
   * @example
   * ```typescript
   * this.report(
   *   'File exceeds size limit',
   *   filePath,
   *   undefined,
   *   'size-error',
   *   { fix: 'Split into smaller files' }
   * );
   * ```
   */
  protected report(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    // Check inline disable comments
    if (ruleId && this.isRuleDisabledByComment(file, line, ruleId)) {
      return;
    }

    // Check if rule is enabled in config for this specific file
    if (ruleId && this.configResolver && file) {
      if (!this.configResolver.isRuleEnabled(ruleId, file)) {
        return;
      }
    }

    // Store issue without severity - will be determined from config in getResult()
    this.issues.push({
      message,
      file,
      line,
      ruleId,
      fix: options?.fix,
      explanation: options?.explanation,
      howToFix: options?.howToFix,
      autoFix: options?.autoFix,
    });
  }

  /**
   * Report an error (backward compatibility wrapper)
   *
   * Convenience method for reporting errors. When a ruleId is provided,
   * delegates to report() which respects config. When no ruleId is provided,
   * creates an issue with default error severity for backward compatibility.
   */
  protected reportError(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    // For backward compatibility: if no ruleId, mark as error by default
    if (!ruleId) {
      this.issues.push({
        message,
        file,
        line,
        defaultSeverity: 'error',
        fix: options?.fix,
        explanation: options?.explanation,
        howToFix: options?.howToFix,
        autoFix: options?.autoFix,
      });
    } else {
      this.report(message, file, line, ruleId, options);
    }
  }

  /**
   * Report a warning (backward compatibility wrapper)
   *
   * Convenience method for reporting warnings. When a ruleId is provided,
   * delegates to report() which respects config. When no ruleId is provided,
   * creates an issue with default warning severity for backward compatibility.
   */
  protected reportWarning(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    // For backward compatibility: if no ruleId, mark as warning by default
    if (!ruleId) {
      this.issues.push({
        message,
        file,
        line,
        defaultSeverity: 'warning',
        fix: options?.fix,
        explanation: options?.explanation,
        howToFix: options?.howToFix,
        autoFix: options?.autoFix,
      });
    } else {
      this.report(message, file, line, ruleId, options);
    }
  }

  /**
   * Check if rule is disabled by inline comment
   * @deprecated Internal method renamed to isRuleDisabledByComment for clarity
   */
  protected isRuleDisabled(file?: string, line?: number, ruleId?: RuleId): boolean {
    return this.isRuleDisabledByComment(file, line, ruleId);
  }

  /**
   * Check if rule is disabled by inline comment (claudelint-disable)
   */
  protected isRuleDisabledByComment(file?: string, line?: number, ruleId?: RuleId): boolean {
    if (!file || !ruleId) {
      return false;
    }

    const disabled = this.disabledRules.get(file) || [];
    for (const rule of disabled) {
      if (rule.ruleId === ruleId || rule.ruleId === 'all') {
        // Check if line is within disabled range
        if (rule.startLine === undefined && rule.endLine === undefined) {
          // File-level disable
          rule.used = true;
          return true;
        }
        if (line !== undefined) {
          if (rule.startLine !== undefined && rule.endLine !== undefined) {
            // Range disable
            if (line >= rule.startLine && line <= rule.endLine) {
              rule.used = true;
              return true;
            }
          } else if (rule.startLine === line) {
            // Single line disable
            rule.used = true;
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Set current file context for config resolution
   *
   * Must be called before accessing rule options or checking if rules are enabled.
   * Typically called at the start of validating each file.
   *
   * @param filePath - Path to the file being validated
   *
   * @example
   * ```typescript
   * for (const file of files) {
   *   this.setCurrentFile(file);
   *   const options = this.getRuleOptions('my-rule');
   *   // ...validate file
   * }
   * ```
   */
  protected setCurrentFile(filePath: string): void {
    this.currentFile = filePath;
  }

  /**
   * Check if a rule is enabled in the configuration
   *
   * A rule is enabled if:
   * - No config is provided (all rules enabled by default)
   * - Rule is not configured (defaults to enabled)
   * - Rule is configured with severity "warn" or "error"
   *
   * A rule is disabled if configured with severity "off".
   *
   * @param ruleId - The rule ID to check
   * @returns true if rule is enabled, false if disabled
   *
   * @example
   * ```typescript
   * if (this.isRuleEnabledInConfig('size-error')) {
   *   // Perform validation
   * }
   * ```
   */
  protected isRuleEnabledInConfig(ruleId: RuleId): boolean {
    // If no config resolver, rule is enabled (default behavior)
    if (!this.configResolver || !this.currentFile) {
      return true;
    }

    return this.configResolver.isRuleEnabled(ruleId, this.currentFile);
  }

  /**
   * Get options for a specific rule
   *
   * Returns configured options or default options from rule registry.
   * Options are type-safe when using the generic parameter.
   *
   * @param ruleId - The rule ID
   * @returns Typed options object or undefined
   *
   * @example
   * ```typescript
   * interface SizeErrorOptions {
   *   maxSize?: number;
   * }
   *
   * const options = this.getRuleOptions<SizeErrorOptions>('size-error');
   * const maxSize = options?.maxSize ?? 50000;
   * ```
   */
  protected getRuleOptions<T = Record<string, unknown>>(ruleId: RuleId): T | undefined {
    if (!this.configResolver || !this.currentFile) {
      // Return default options from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.defaultOptions as T | undefined;
    }

    const options = this.configResolver.getRuleOptions(ruleId, this.currentFile);
    return options[0] as T | undefined;
  }

  protected parseDisableComments(filePath: string, content: string): void {
    const lines = content.split('\n');
    const rules: DisabledRule[] = [];
    const activeDisables: Map<string, { startLine: number; commentLine: number }> = new Map();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // claudelint-disable-file (with or without rule ID)
      const fileDisableMatch = line.match(/<!--\s*claudelint-disable-file(?:\s+([a-z-]+))?\s*-->/);
      if (fileDisableMatch) {
        const ruleId = fileDisableMatch[1] || 'all';
        rules.push({ ruleId, commentLine: lineNumber, used: false });
        continue;
      }

      // claudelint-disable-next-line (with or without rule ID)
      const nextLineMatch = line.match(
        /<!--\s*claudelint-disable-next-line(?:\s+([a-z-]+))?\s*-->/
      );
      if (nextLineMatch && i + 1 < lines.length) {
        const ruleId = nextLineMatch[1] || 'all';
        rules.push({ ruleId, startLine: lineNumber + 1, commentLine: lineNumber, used: false });
        continue;
      }

      // claudelint-disable-line (on current line, with or without rule ID)
      const disableLineMatch = line.match(/<!--\s*claudelint-disable-line(?:\s+([a-z-]+))?\s*-->/);
      if (disableLineMatch) {
        const ruleId = disableLineMatch[1] || 'all';
        rules.push({ ruleId, startLine: lineNumber, commentLine: lineNumber, used: false });
        continue;
      }

      // claudelint-disable (start range, with or without rule ID)
      const disableMatch = line.match(/<!--\s*claudelint-disable(?:\s+([a-z-]+))?\s*-->/);
      if (disableMatch) {
        const ruleId = disableMatch[1] || 'all';
        activeDisables.set(ruleId, { startLine: lineNumber, commentLine: lineNumber });
        continue;
      }

      // claudelint-enable (end range, with or without rule ID)
      const enableMatch = line.match(/<!--\s*claudelint-enable(?:\s+([a-z-]+))?\s*-->/);
      if (enableMatch) {
        const ruleId = enableMatch[1] || 'all';
        const disable = activeDisables.get(ruleId);
        if (disable) {
          rules.push({
            ruleId,
            startLine: disable.startLine,
            endLine: lineNumber,
            commentLine: disable.commentLine,
            used: false,
          });
          activeDisables.delete(ruleId);
        }
      }
    }

    // Handle unclosed disable blocks (disable to end of file)
    for (const [ruleId, disable] of activeDisables.entries()) {
      rules.push({
        ruleId,
        startLine: disable.startLine,
        endLine: lines.length,
        commentLine: disable.commentLine,
        used: false,
      });
    }

    if (rules.length > 0) {
      this.disabledRules.set(filePath, rules);
    }
  }

  /**
   * Report unused disable directives
   */
  protected reportUnusedDisables(filePath: string): void {
    const disabled = this.disabledRules.get(filePath) || [];

    for (const rule of disabled) {
      if (!rule.used) {
        const directive =
          rule.startLine === undefined && rule.endLine === undefined
            ? 'claudelint-disable-file'
            : rule.startLine !== undefined && rule.endLine !== undefined
              ? 'claudelint-disable'
              : rule.startLine !== undefined
                ? 'claudelint-disable-next-line or claudelint-disable-line'
                : 'claudelint-disable';

        const ruleIdDisplay = rule.ruleId === 'all' ? '(all rules)' : `'${rule.ruleId}'`;

        this.reportWarning(
          `Unused disable directive for ${ruleIdDisplay}`,
          filePath,
          rule.commentLine,
          undefined, // unused-disable is a meta-rule, not a validation rule
          {
            explanation: `This ${directive} comment doesn't suppress any violations`,
            howToFix: 'Remove the unused disable comment',
          }
        );
      }
    }
  }

  /**
   * Get configured severity for a rule
   *
   * @param ruleId - The rule ID to check
   * @param filePath - The file path to resolve config for (optional, uses currentFile if not provided)
   * @returns 'error', 'warn', or 'off'
   */
  protected getSeverityFromConfig(ruleId: RuleId, filePath?: string): 'off' | 'warn' | 'error' {
    const file = filePath || this.currentFile;

    if (!this.configResolver || !file) {
      // No config - use rule's default severity from registry
      const rule = RuleRegistry.get(ruleId);
      return rule?.severity ?? 'error';
    }

    return this.configResolver.getRuleSeverity(ruleId, file);
  }

  /**
   * Compile issues into final validation result
   *
   * Applies severity from configuration to each issue.
   *
   * @returns ValidationResult with errors and warnings
   */
  protected getResult(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Apply config-based severity to all issues
    for (const issue of this.issues) {
      // Determine severity from config, or use defaultSeverity for backward compatibility
      let severity: 'off' | 'warn' | 'error';
      if (issue.ruleId) {
        severity = this.getSeverityFromConfig(issue.ruleId, issue.file);
      } else {
        // No ruleId - use defaultSeverity for backward compatibility
        severity = issue.defaultSeverity === 'warning' ? 'warn' : 'error';
      }

      if (severity === 'off') {
        // Rule is disabled - skip this issue
        continue;
      }

      // Create error or warning based on configured severity
      if (severity === 'error') {
        errors.push({
          ...issue,
          severity: 'error',
        });
      } else if (severity === 'warn') {
        warnings.push({
          ...issue,
          severity: 'warning',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Read and parse a JSON file
   * Reports errors if file cannot be read or contains invalid JSON
   * Returns parsed object or null if errors occurred
   */
  protected async readAndParseJSON<T = unknown>(filePath: string): Promise<T | null> {
    let content: string;

    try {
      content = await readFileContent(filePath);
    } catch (error) {
      this.reportError(
        `Failed to read file: ${formatError(error)}`,
        filePath
      );
      return null;
    }

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      this.reportError(
        `Invalid JSON syntax: ${formatError(error)}`,
        filePath
      );
      return null;
    }
  }

  /**
   * Validate a tool name against the list of valid tools
   * Reports a warning if the tool is unknown
   * Returns true if valid or if wildcard (*) is provided
   */
  protected validateToolName(toolName: string, filePath: string, context = 'tool'): boolean {
    if (toolName === '*') {
      return true;
    }

    if (!(VALID_TOOLS as readonly string[]).includes(toolName)) {
      this.reportWarning(`Unknown ${context}: ${toolName}`, filePath);
      return false;
    }

    return true;
  }

  /**
   * Validate an event name against the list of valid hook events
   * Reports a warning if the event is unknown
   * Returns true if valid
   */
  protected validateEventName(eventName: string, filePath: string, context = 'event'): boolean {
    if (!(VALID_HOOK_EVENTS as readonly string[]).includes(eventName)) {
      this.reportWarning(`Unknown ${context}: ${eventName}`, filePath);
      return false;
    }

    return true;
  }

  /**
   * Validate frontmatter with schema and check name matches expected value
   *
   * This method consolidates the common pattern of:
   * 1. Validating frontmatter against a schema
   * 2. Checking that the name field matches the directory/file name
   * 3. Merging schema validation results into the validator
   *
   * Used by agents, skills, and output-styles validators.
   *
   * @param filePath - Path to file being validated
   * @param content - Content of file being validated
   * @param schema - Zod schema for frontmatter validation
   * @param expectedName - Expected value for the name field
   * @param entityType - Type of entity (e.g., 'Agent', 'Skill', 'Output style')
   * @param ruleIdPrefix - Prefix for rule IDs (e.g., 'agent', 'skill')
   * @returns Parsed frontmatter or null if validation failed
   */
  protected validateFrontmatterWithNameCheck<T>(
    filePath: string,
    content: string,
    schema: z.ZodType,
    expectedName: string,
    entityType: string,
    ruleIdPrefix: string
  ): T | null {
    const validationResult = validateFrontmatterWithSchema(
      content,
      schema,
      filePath,
      ruleIdPrefix
    );
    const frontmatter = validationResult.data as T | null;
    const result = validationResult.result;

    this.mergeSchemaValidationResult(result);

    if (!frontmatter) {
      return null;
    }

    // Name validation with proper ruleId
    const fmWithName = frontmatter as { name?: string };
    if (fmWithName.name !== expectedName) {
      this.reportError(
        `${entityType} name "${fmWithName.name}" does not match directory name "${expectedName}"`,
        filePath,
        undefined,
        `${ruleIdPrefix}-name-mismatch` as RuleId
      );
    }

    return frontmatter as T;
  }

  /**
   * Validate body content structure (length and sections)
   *
   * This method provides configurable validation for markdown body content,
   * checking for minimum length and required sections.
   *
   * Used by agents, skills, and output-styles validators.
   *
   * @param filePath - Path to file being validated
   * @param content - Content of file being validated
   * @param rules - Validation rules to apply
   */
  protected validateBodyContentStructure(
    filePath: string,
    content: string,
    rules: {
      minLength?: {
        threshold: number;
        ruleId: RuleId;
        message: string;
      };
      requiredSections?: Array<{
        name: string;
        pattern: RegExp;
        ruleId: RuleId;
        message: string;
      }>;
    }
  ): void {
    const body = this.extractBody(content);

    // Min length check
    if (rules.minLength && body.length < rules.minLength.threshold) {
      this.reportWarning(rules.minLength.message, filePath, undefined, rules.minLength.ruleId);
    }

    // Required sections check
    if (rules.requiredSections) {
      for (const section of rules.requiredSections) {
        if (!section.pattern.test(body)) {
          this.reportWarning(section.message, filePath, undefined, section.ruleId);
        }
      }
    }
  }

  /**
   * Extract body content from markdown (content after frontmatter)
   *
   * @param content - Full markdown content including frontmatter
   * @returns Body content without frontmatter
   */
  private extractBody(content: string): string {
    const parts = content.split('---');
    return parts.length >= 3 ? parts.slice(2).join('---').trim() : content;
  }

  /**
   * Validate all matching files in a directory
   *
   * This method provides a generic pattern for directory traversal and file validation.
   * Handles optional vs required checks gracefully with configurable error handling.
   *
   * @param dirPath - Directory to scan
   * @param filter - Function to filter directory entries
   * @param processor - Async function to process each matching file
   * @param context - Whether this is an 'optional' or 'required' check
   */
  protected async validateFilesInDirectory(
    dirPath: string,
    filter: (entry: Dirent) => boolean,
    processor: (filePath: string, content: string) => Promise<void>,
    context: 'optional' | 'required' = 'optional'
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const matching = entries.filter(filter);

      for (const entry of matching) {
        const filePath = path.join(dirPath, entry.name);
        const content = await readFileContent(filePath);
        await processor(filePath, content);
      }
    } catch (error) {
      if (context === 'required') {
        this.reportError(`Failed to read directory: ${formatError(error)}`, dirPath);
      }
      // Optional checks fail silently
    }
  }

  /**
   * Execute rules on all matching files in a directory
   *
   * Combines file walking with category-based rule execution.
   * This is a convenience wrapper around validateFilesInDirectory.
   *
   * @param dirPath - Directory to scan
   * @param filter - Function to filter directory entries
   * @param category - Rule category to execute
   * @param context - Whether this is an 'optional' or 'required' check
   */
  protected async executeRulesOnMatchingFiles(
    dirPath: string,
    filter: (entry: Dirent) => boolean,
    category: RuleCategory,
    context: 'optional' | 'required' = 'optional'
  ): Promise<void> {
    await this.validateFilesInDirectory(
      dirPath,
      filter,
      async (filePath, content) => {
        await this.executeRulesForCategory(category, filePath, content);
      },
      context
    );
  }

  /**
   * Try to read a directory with configurable error handling
   *
   * @param dirPath - Path to directory
   * @param context - Whether this is an 'optional' or 'required' check
   * @returns Directory entries or null if failed
   */
  protected async tryReadDirectory(
    dirPath: string,
    context: 'optional' | 'required' = 'required'
  ): Promise<Dirent[] | null> {
    try {
      return await fs.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      if (context === 'required') {
        this.reportError(`Failed to read directory: ${formatError(error)}`, dirPath);
      }
      return null;
    }
  }

  /**
   * Try to read a file with configurable error handling
   *
   * @param filePath - Path to file
   * @param context - Whether this is an 'optional' or 'required' check
   * @returns File content or null if failed
   */
  protected async tryReadFile(
    filePath: string,
    context: 'optional' | 'required' = 'required'
  ): Promise<string | null> {
    try {
      return await readFileContent(filePath);
    } catch (error) {
      if (context === 'required') {
        this.reportError(`Failed to read file: ${formatError(error)}`, filePath);
      }
      return null;
    }
  }

  /**
   * Filter directories by name (optional filter)
   *
   * @param directories - List of directory paths
   * @param filterName - Optional name to filter by
   * @returns Filtered list of directories
   */
  protected filterDirectoriesByName(
    directories: string[],
    filterName?: string
  ): string[] {
    if (!filterName) {
      return directories;
    }

    return directories.filter((dir) => path.basename(dir) === filterName);
  }

  /**
   * Execute a new-style Rule object on a file
   *
   * This enables dual-mode operation during migration to ESLint-style rules.
   * New rules can be executed alongside existing validator methods.
   *
   * @param rule - The Rule object to execute
   * @param filePath - Path to file being validated
   * @param fileContent - Content of file being validated
   *
   * @example
   * ```typescript
   * import { rule as sizeErrorRule } from '../rules/claude-md/size-error';
   *
   * async validate() {
   *   for (const file of files) {
   *     const content = await readFileContent(file);
   *     await this.executeRule(sizeErrorRule, file, content);
   *   }
   * }
   * ```
   */
  protected async executeRule(
    rule: {
      meta: { id: RuleId };
      validate: (context: {
        filePath: string;
        fileContent: string;
        options: Record<string, unknown>;
        report: (issue: {
          message: string;
          line?: number;
          fix?: string;
          explanation?: string;
          howToFix?: string;
        }) => void;
      }) => Promise<void> | void;
    },
    filePath: string,
    fileContent: string
  ): Promise<void> {
    // Set current file for config resolution
    this.setCurrentFile(filePath);

    // Check if rule is enabled in config
    if (!this.isRuleEnabledInConfig(rule.meta.id)) {
      return;
    }

    // Get rule options from config (or defaults)
    const options = this.getRuleOptions<Record<string, unknown>>(rule.meta.id) || {};

    // Create context for the rule
    const context = {
      filePath,
      fileContent,
      options,
      report: (issue: {
        message: string;
        line?: number;
        fix?: string;
        explanation?: string;
        howToFix?: string;
      }) => {
        // Report issue using existing BaseValidator.report()
        this.report(issue.message, filePath, issue.line, rule.meta.id, {
          fix: issue.fix,
          explanation: issue.explanation,
          howToFix: issue.howToFix,
        });
      },
    };

    // Execute the rule's validate function
    try {
      await rule.validate(context);
    } catch (error) {
      // Report rule execution errors
      this.reportError(
        `Rule '${rule.meta.id}' failed: ${formatError(error)}`,
        filePath,
        undefined,
        rule.meta.id
      );
    }
  }

  /**
   * Execute all rules for a specific category on a file
   *
   * This method discovers rules via RuleRegistry and executes them all automatically.
   * Respects config for enabling/disabling and severity overrides.
   *
   * This is the recommended pattern for Phase 2 - validators should use category-based
   * execution instead of manually importing and executing individual rules.
   *
   * @param category - Rule category (e.g., 'CLAUDE.md', 'Skills', 'MCP')
   * @param filePath - Path to file being validated
   * @param fileContent - Content of file being validated
   *
   * @example
   * ```typescript
   * async validate() {
   *   const files = await this.findFiles();
   *
   *   for (const file of files) {
   *     const content = await readFileContent(file);
   *     // Executes ALL rules for this category automatically
   *     await this.executeRulesForCategory('MCP', file, content);
   *   }
   *
   *   return this.getResult();
   * }
   * ```
   */
  protected async executeRulesForCategory(
    category: RuleCategory,
    filePath: string,
    fileContent: string
  ): Promise<void> {
    // Discover all rules for this category from RuleRegistry
    const rules = RuleRegistry.getRulesByCategory(category);

    // Execute each rule
    for (const rule of rules) {
      await this.executeRule(rule, filePath, fileContent);
    }
  }
}
