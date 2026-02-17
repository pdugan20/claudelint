/**
 * Compact formatter - One line per issue
 *
 * Outputs one line per lint issue, suitable for parsing
 * and integration with other tools.
 *
 * @packageDocumentation
 */

import { LintResult, Formatter } from '../types';

/** Compact one-line-per-issue formatter */
export class CompactFormatter implements Formatter {
  /** Format lint results as compact one-line-per-issue output */
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
