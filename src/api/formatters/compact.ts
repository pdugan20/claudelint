/**
 * Compact formatter - One line per issue
 *
 * Outputs one line per lint issue, suitable for parsing
 * and integration with other tools.
 *
 * @module api/formatters/compact
 */

import { LintResult, Formatter } from '../types';

/**
 * Compact formatter for lint results
 *
 * Provides compact, one-line-per-issue output suitable for parsing
 */
export class CompactFormatter implements Formatter {
  format(results: LintResult[]): string {
    let output = '';

    for (const result of results) {
      for (const message of result.messages) {
        const location = message.line ? `:${message.line}:${message.column || 0}` : '';
        const severity = message.severity === 'error' ? 'Error' : 'Warning';

        output += `${result.filePath}${location}: ${severity} - ${message.message}`;

        if (message.ruleId) {
          output += ` (${message.ruleId})`;
        }

        output += '\n';
      }
    }

    return output;
  }
}
