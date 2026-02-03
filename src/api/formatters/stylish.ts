/**
 * Stylish formatter - Human-readable colored output
 *
 * Similar to ESLint's stylish formatter, provides a clean,
 * easy-to-read output format with colors and structure.
 *
 * @module api/formatters/stylish
 */

import { LintResult } from '../types';
import { BaseFormatter } from '../formatter';

/**
 * Stylish formatter for lint results
 *
 * Provides human-readable, colored output similar to ESLint's default formatter
 */
export class StylishFormatter extends BaseFormatter {
  format(results: LintResult[]): string {
    let output = '';
    const summary = this.getSummary(results);

    // Output each file's results
    for (const result of results) {
      if (result.errorCount === 0 && result.warningCount === 0) {
        continue; // Skip files with no issues
      }

      output += `\n${this.getRelativePath(result.filePath)}\n`;

      for (const message of result.messages) {
        const location = message.line ? `${message.line}:${message.column || 0}` : '-';
        const severity = message.severity === 'error' ? 'error' : 'warning';
        output += `  ${location}  ${severity}  ${message.message}`;

        if (message.ruleId) {
          output += `  ${message.ruleId}`;
        }

        output += '\n';
      }
    }

    // Summary
    if (summary.totalIssues > 0) {
      output += `\n${summary.errorCount} errors, ${summary.warningCount} warnings\n`;

      if (summary.fixableErrorCount > 0 || summary.fixableWarningCount > 0) {
        const fixable = summary.fixableErrorCount + summary.fixableWarningCount;
        output += `${fixable} issues can be fixed automatically\n`;
      }
    } else if (summary.fileCount > 0) {
      output += '\nNo issues found\n';
    }

    return output;
  }
}
