/**
 * Result builder for converting validation results to LintResult format
 *
 * This module provides utilities to convert claudelint's internal ValidationResult
 * format to the standardized LintResult format used by the programmatic API.
 *
 * @module api/result-builder
 */

import { LintResult, LintMessage } from './types';
import { ValidationResult } from '../validators/file-validator';
import { buildLintMessage } from './message-builder';

/**
 * Build a LintResult from a ValidationResult
 *
 * Converts the internal ValidationResult format to the standardized LintResult
 * format used by the programmatic API. Calculates counts, extracts messages,
 * and preserves source/output content.
 *
 * @param filePath - Absolute path to the file
 * @param validationResult - Result from validator
 * @param source - Original source code (optional)
 * @param output - Fixed source code (optional)
 * @param validationTime - Time taken to validate in milliseconds (optional)
 * @returns Standardized LintResult
 *
 * @example
 * ```typescript
 * const validationResult = await validator.validate();
 * const lintResult = buildLintResult(
 *   '/path/to/file.md',
 *   validationResult,
 *   sourceCode,
 *   fixedCode,
 *   45
 * );
 * ```
 */
export function buildLintResult(
  filePath: string,
  validationResult: ValidationResult,
  source?: string,
  output?: string,
  validationTime?: number
): LintResult {
  // Convert errors and warnings to LintMessage format
  const errorMessages: LintMessage[] = validationResult.errors.map((error) =>
    buildLintMessage(error, 'error')
  );

  const warningMessages: LintMessage[] = validationResult.warnings.map((warning) =>
    buildLintMessage(warning, 'warning')
  );

  // Combine all messages
  const messages = [...errorMessages, ...warningMessages];

  // Calculate fixable counts
  const fixableErrorCount = errorMessages.filter((msg) => msg.fix !== undefined).length;
  const fixableWarningCount = warningMessages.filter((msg) => msg.fix !== undefined).length;

  // Build the result
  const result: LintResult = {
    filePath,
    messages,
    suppressedMessages: [],
    errorCount: validationResult.errors.length,
    warningCount: validationResult.warnings.length,
    fixableErrorCount,
    fixableWarningCount,
  };

  // Add source if provided
  if (source !== undefined) {
    result.source = source;
  }

  // Add output if provided
  if (output !== undefined) {
    result.output = output;
  }

  // Add stats if validation time provided
  if (validationTime !== undefined) {
    result.stats = {
      validationTime,
    };
  }

  // Add deprecated rules used if present
  if (validationResult.deprecatedRulesUsed && validationResult.deprecatedRulesUsed.length > 0) {
    result.deprecatedRulesUsed = validationResult.deprecatedRulesUsed;
  }

  return result;
}

/**
 * Build an empty LintResult for a file with no issues
 *
 * Creates a "clean" result indicating that a file has no validation errors
 * or warnings. Useful for files that pass all checks.
 *
 * @param filePath - Absolute path to the file
 * @param source - Original source code (optional)
 * @param validationTime - Time taken to validate in milliseconds (optional)
 * @returns Clean LintResult with zero issues
 *
 * @example
 * ```typescript
 * const result = buildCleanResult('/path/to/valid-file.md', sourceCode, 23);
 * ```
 */
export function buildCleanResult(
  filePath: string,
  source?: string,
  validationTime?: number
): LintResult {
  const result: LintResult = {
    filePath,
    messages: [],
    suppressedMessages: [],
    errorCount: 0,
    warningCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
  };

  if (source !== undefined) {
    result.source = source;
  }

  if (validationTime !== undefined) {
    result.stats = {
      validationTime,
    };
  }

  return result;
}

/**
 * Merge multiple LintResults for the same file
 *
 * Combines results from multiple validators that ran on the same file.
 * Useful when a file is validated by multiple validators and you need to
 * consolidate the results.
 *
 * @param results - Array of LintResults for the same file
 * @returns Single merged LintResult
 *
 * @example
 * ```typescript
 * const skillResult = await skillValidator.validate();
 * const securityResult = await securityValidator.validate();
 *
 * const merged = mergeLintResults([
 *   buildLintResult('/path/to/SKILL.md', skillResult),
 *   buildLintResult('/path/to/SKILL.md', securityResult)
 * ]);
 * ```
 */
export function mergeLintResults(results: LintResult[]): LintResult {
  if (results.length === 0) {
    throw new Error('Cannot merge empty results array');
  }

  if (results.length === 1) {
    return results[0];
  }

  // Verify all results are for the same file
  const filePath = results[0].filePath;
  for (const result of results) {
    if (result.filePath !== filePath) {
      throw new Error(
        `Cannot merge results for different files: ${filePath} vs ${result.filePath}`
      );
    }
  }

  // Merge all messages
  const allMessages: LintMessage[] = [];
  const allSuppressed: LintMessage[] = [];
  const deprecatedRulesMap = new Map<
    string,
    import('../validators/file-validator').DeprecatedRuleUsage
  >();
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFixableErrors = 0;
  let totalFixableWarnings = 0;
  let totalValidationTime = 0;

  for (const result of results) {
    allMessages.push(...result.messages);
    allSuppressed.push(...result.suppressedMessages);
    totalErrors += result.errorCount;
    totalWarnings += result.warningCount;
    totalFixableErrors += result.fixableErrorCount;
    totalFixableWarnings += result.fixableWarningCount;
    if (result.stats) {
      totalValidationTime += result.stats.validationTime;
    }
    // Merge deprecated rules (deduplicate by ruleId)
    if (result.deprecatedRulesUsed) {
      for (const deprecatedRule of result.deprecatedRulesUsed) {
        deprecatedRulesMap.set(deprecatedRule.ruleId, deprecatedRule);
      }
    }
  }

  // Use source/output from the last result (if any)
  const lastResult = results[results.length - 1];

  // Convert deprecated rules map to array
  const mergedDeprecatedRules =
    deprecatedRulesMap.size > 0 ? Array.from(deprecatedRulesMap.values()) : undefined;

  return {
    filePath,
    messages: allMessages,
    suppressedMessages: allSuppressed,
    errorCount: totalErrors,
    warningCount: totalWarnings,
    fixableErrorCount: totalFixableErrors,
    fixableWarningCount: totalFixableWarnings,
    source: lastResult.source,
    output: lastResult.output,
    stats: totalValidationTime > 0 ? { validationTime: totalValidationTime } : undefined,
    deprecatedRulesUsed: mergedDeprecatedRules,
  };
}

/**
 * Sort messages within a LintResult by line and column
 *
 * @param result - LintResult to sort
 * @returns New LintResult with sorted messages
 */
export function sortLintResult(result: LintResult): LintResult {
  const sortMessages = (messages: LintMessage[]): LintMessage[] => {
    return [...messages].sort((a, b) => {
      // Sort by line first
      if (a.line !== undefined && b.line !== undefined && a.line !== b.line) {
        return a.line - b.line;
      }

      // Then by column
      if (a.column !== undefined && b.column !== undefined && a.column !== b.column) {
        return a.column - b.column;
      }

      // Finally by severity (errors first)
      if (a.severity !== b.severity) {
        return a.severity === 'error' ? -1 : 1;
      }

      return 0;
    });
  };

  return {
    ...result,
    messages: sortMessages(result.messages),
    suppressedMessages: sortMessages(result.suppressedMessages),
  };
}
