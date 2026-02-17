/**
 * Stylish formatter - Human-readable colored output
 *
 * Similar to ESLint's stylish formatter, provides a clean,
 * easy-to-read output format with colors and structure.
 *
 * @packageDocumentation
 */

import { LintResult } from '../types';
import { BaseFormatter } from '../formatter';

/** Human-readable terminal formatter with colors */
export class StylishFormatter extends BaseFormatter {
  /** Format lint results as human-readable colored output */
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

    // Deprecation warnings
    const deprecatedRules = this.collectDeprecatedRules(results);
    if (deprecatedRules.length > 0) {
      output += '\nDeprecated rules used:\n';
      for (const rule of deprecatedRules) {
        output += `  - ${rule.ruleId}: ${rule.reason}`;
        if (rule.replacedBy && rule.replacedBy.length > 0) {
          output += ` (use ${rule.replacedBy.join(', ')} instead)`;
        }
        if (rule.removeInVersion) {
          output += ` [will be removed in ${rule.removeInVersion}]`;
        }
        if (rule.url) {
          output += `\n    Migration guide: ${rule.url}`;
        }
        output += '\n';
      }
    }

    return output;
  }

  /**
   * Collect all unique deprecated rules from results
   */
  private collectDeprecatedRules(
    results: LintResult[]
  ): import('../../validators/file-validator').DeprecatedRuleUsage[] {
    const rulesMap = new Map<
      string,
      import('../../validators/file-validator').DeprecatedRuleUsage
    >();

    for (const result of results) {
      if (result.deprecatedRulesUsed) {
        for (const rule of result.deprecatedRulesUsed) {
          rulesMap.set(rule.ruleId, rule);
        }
      }
    }

    return Array.from(rulesMap.values());
  }
}
