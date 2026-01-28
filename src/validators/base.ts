// Base validator class that all validators extend

import { readFileContent } from '../utils/file-system';
import { VALID_TOOLS, VALID_HOOK_EVENTS } from '../schemas/constants';
import { ClaudeLintConfig } from '../utils/config';
import { formatError } from '../utils/validation-helpers';
import { RuleId } from '../rules/rule-ids';

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
  ruleId: RuleId | 'all' | string; // Allow string for invalid rule IDs from comments
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
 *     this.reportError('Error message', 'file.md', 10, 'rule-id');
 *     return this.getResult();
 *   }
 * }
 * ```
 */
export abstract class BaseValidator {
  protected options: BaseValidatorOptions;
  protected errors: ValidationError[] = [];
  protected warnings: ValidationWarning[] = [];
  protected disabledRules: Map<string, DisabledRule[]> = new Map(); // file path -> disabled rules

  /**
   * Creates a new validator instance
   * @param options - Validation options
   */
  constructor(options: BaseValidatorOptions = {}) {
    this.options = options;
  }

  /**
   * Performs validation and returns results
   * @returns Promise resolving to validation results
   */
  abstract validate(): Promise<ValidationResult>;

  protected reportError(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    if (this.isRuleDisabled(file, line, ruleId)) {
      return;
    }
    this.errors.push({
      message,
      file,
      line,
      severity: 'error',
      ruleId,
      fix: options?.fix,
      explanation: options?.explanation,
      howToFix: options?.howToFix,
      autoFix: options?.autoFix,
    });
  }

  protected reportWarning(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string; autoFix?: AutoFix }
  ): void {
    if (this.isRuleDisabled(file, line, ruleId)) {
      return;
    }
    this.warnings.push({
      message,
      file,
      line,
      severity: 'warning',
      ruleId,
      fix: options?.fix,
      explanation: options?.explanation,
      howToFix: options?.howToFix,
      autoFix: options?.autoFix,
    });
  }

  protected isRuleDisabled(file?: string, line?: number, ruleId?: RuleId): boolean {
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

  protected getResult(): ValidationResult {
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
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

    if (!VALID_TOOLS.includes(toolName as any)) {
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
    if (!VALID_HOOK_EVENTS.includes(eventName as any)) {
      this.reportWarning(`Unknown ${context}: ${eventName}`, filePath);
      return false;
    }

    return true;
  }
}
