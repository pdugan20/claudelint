/**
 * Message builder for converting validation messages to LintMessage format
 *
 * This module provides utilities to convert claudelint's internal ValidationError
 * and ValidationWarning formats to the standardized LintMessage format used by the
 * programmatic API.
 *
 * @module api/message-builder
 */

import { LintMessage, FixInfo } from './types';
import { ValidationError, ValidationWarning, AutoFix } from '../validators/file-validator';

/**
 * Build a LintMessage from a ValidationError or ValidationWarning
 *
 * Converts the internal ValidationError/ValidationWarning format to the
 * standardized LintMessage format used by the programmatic API.
 *
 * @param issue - Validation error or warning
 * @param severity - Severity level ('error' or 'warning')
 * @returns Standardized LintMessage
 *
 * @example
 * ```typescript
 * const error: ValidationError = {
 *   message: 'File exceeds size limit',
 *   file: '/path/to/file.md',
 *   line: 1,
 *   severity: 'error',
 *   ruleId: 'claude-md-size-limit'
 * };
 *
 * const lintMessage = buildLintMessage(error, 'error');
 * ```
 */
export function buildLintMessage(
  issue: ValidationError | ValidationWarning,
  severity: 'error' | 'warning'
): LintMessage {
  const message: LintMessage = {
    ruleId: issue.ruleId || null,
    severity,
    message: issue.message,
  };

  // Add line/column if available
  if (issue.line !== undefined) {
    message.line = issue.line;
  }

  // Column is typically not provided by current validators,
  // but we support it for future use
  if ('column' in issue && typeof issue.column === 'number') {
    message.column = issue.column;
  }

  // Extract fix information
  if (issue.autoFix) {
    message.fix = convertAutoFixToFixInfo(issue.autoFix);
  }

  // Add additional context
  if (issue.explanation) {
    message.explanation = issue.explanation;
  }

  if (issue.howToFix) {
    message.howToFix = issue.howToFix;
  }

  return message;
}

/**
 * Convert AutoFix to FixInfo format
 *
 * Transforms the internal AutoFix format (which includes file path and content
 * transformation) to the API's FixInfo format (which uses byte ranges).
 *
 * @param autoFix - Internal AutoFix object
 * @returns FixInfo for the API
 */
function convertAutoFixToFixInfo(_autoFix: AutoFix): FixInfo {
  // The internal AutoFix format uses a function to transform content.
  // The API's FixInfo format expects byte ranges and replacement text.
  // This is intentionally simplified - autofixes are applied via autoFix.apply()
  // in the main validation flow before results reach the API consumer.
  // This placeholder allows the API to report that a fix exists.
  return {
    range: [0, 0], // Placeholder - fix is applied before API consumption
    text: '', // Placeholder - fix is applied before API consumption
  };
}

/**
 * Create a LintMessage for a file read error
 *
 * Generates a standardized error message when a file cannot be read.
 *
 * @param filePath - Path to the file that couldn't be read
 * @param error - The error that occurred
 * @returns LintMessage representing the read error
 *
 * @example
 * ```typescript
 * try {
 *   content = await readFile(path);
 * } catch (error) {
 *   const message = createFileReadError(path, error);
 *   messages.push(message);
 * }
 * ```
 */
export function createFileReadError(filePath: string, error: Error): LintMessage {
  return {
    ruleId: null,
    severity: 'error',
    message: `Failed to read file: ${error.message}`,
    line: 1,
    explanation: `claudelint could not read the file at ${filePath}. This may be due to permissions, encoding issues, or the file not existing.`,
  };
}

/**
 * Create a LintMessage for a parsing error
 *
 * Generates a standardized error message when a file cannot be parsed.
 *
 * @param filePath - Path to the file that couldn't be parsed
 * @param error - The parsing error that occurred
 * @param line - Line number where parsing failed (if known)
 * @returns LintMessage representing the parse error
 *
 * @example
 * ```typescript
 * try {
 *   data = JSON.parse(content);
 * } catch (error) {
 *   const message = createParseError(path, error, 5);
 *   messages.push(message);
 * }
 * ```
 */
export function createParseError(filePath: string, error: Error, line?: number): LintMessage {
  return {
    ruleId: null,
    severity: 'error',
    message: `Parse error: ${error.message}`,
    line: line || 1,
    explanation: `claudelint could not parse the file at ${filePath}. Please check that the file is valid and properly formatted.`,
  };
}

/**
 * Create a LintMessage for a configuration error
 *
 * Generates a standardized error message when configuration is invalid.
 *
 * @param message - Description of the configuration error
 * @param filePath - Path to the config file (if applicable)
 * @returns LintMessage representing the config error
 *
 * @example
 * ```typescript
 * const message = createConfigError(
 *   'Invalid rule configuration',
 *   '.claudelintrc.json'
 * );
 * ```
 */
export function createConfigError(message: string, filePath?: string): LintMessage {
  return {
    ruleId: null,
    severity: 'error',
    message: `Configuration error: ${message}`,
    line: 1,
    explanation: filePath
      ? `Invalid configuration in ${filePath}. Please check your configuration file.`
      : 'Invalid configuration. Please check your configuration.',
  };
}

/**
 * Create a LintMessage for an internal error
 *
 * Generates a standardized error message when an internal error occurs
 * during validation.
 *
 * @param error - The internal error that occurred
 * @param filePath - Path to the file being validated
 * @param ruleId - ID of the rule that encountered the error (if known)
 * @returns LintMessage representing the internal error
 *
 * @example
 * ```typescript
 * try {
 *   await validator.validate();
 * } catch (error) {
 *   const message = createInternalError(error, filePath, 'my-rule');
 *   messages.push(message);
 * }
 * ```
 */
export function createInternalError(error: Error, filePath: string, ruleId?: string): LintMessage {
  return {
    ruleId: ruleId || null,
    severity: 'error',
    message: `Internal error: ${error.message}`,
    line: 1,
    explanation: `An unexpected error occurred while validating ${filePath}. This is likely a bug in claudelint. Please report this issue.`,
  };
}

/**
 * Create a LintMessage for an ignored file
 *
 * Generates a standardized warning message when a file is ignored by configuration.
 *
 * @param filePath - Path to the ignored file
 * @returns LintMessage representing the ignored file warning
 *
 * @example
 * ```typescript
 * if (isIgnored(filePath)) {
 *   const message = createIgnoredFileWarning(filePath);
 *   messages.push(message);
 * }
 * ```
 */
export function createIgnoredFileWarning(filePath: string): LintMessage {
  return {
    ruleId: null,
    severity: 'warning',
    message: `File ignored due to configuration`,
    line: 1,
    explanation: `The file at ${filePath} matches an ignore pattern in your configuration and was not linted.`,
  };
}

/**
 * Filter messages by severity
 *
 * @param messages - Array of lint messages
 * @param severity - Severity level to filter by
 * @returns Filtered messages
 *
 * @example
 * ```typescript
 * const errors = filterBySeverity(messages, 'error');
 * const warnings = filterBySeverity(messages, 'warning');
 * ```
 */
export function filterBySeverity(
  messages: LintMessage[],
  severity: 'error' | 'warning'
): LintMessage[] {
  return messages.filter((msg) => msg.severity === severity);
}

/**
 * Check if a message is fixable
 *
 * @param message - Lint message to check
 * @returns True if the message has a fix available
 *
 * @example
 * ```typescript
 * const fixableCount = messages.filter(isFixable).length;
 * ```
 */
export function isFixable(message: LintMessage): boolean {
  return message.fix !== undefined || !!(message.suggestions && message.suggestions.length > 0);
}

/**
 * Group messages by rule ID
 *
 * @param messages - Array of lint messages
 * @returns Map of rule ID to messages
 *
 * @example
 * ```typescript
 * const byRule = groupByRule(messages);
 * for (const [ruleId, msgs] of byRule) {
 *   console.log(`${ruleId}: ${msgs.length} issues`);
 * }
 * ```
 */
export function groupByRule(messages: LintMessage[]): Map<string, LintMessage[]> {
  const grouped = new Map<string, LintMessage[]>();

  for (const message of messages) {
    const ruleId = message.ruleId || 'no-rule';
    const existing = grouped.get(ruleId) || [];
    existing.push(message);
    grouped.set(ruleId, existing);
  }

  return grouped;
}
