/**
 * JSON formatter - Machine-readable JSON output
 *
 * Outputs lint results as JSON, useful for tooling integration
 * and programmatic processing.
 *
 * @module api/formatters/json
 */

import { LintResult, Formatter } from '../types';

/**
 * JSON formatter for lint results
 *
 * Provides machine-readable JSON output for tooling integration
 */
export class JsonFormatter implements Formatter {
  format(results: LintResult[]): string {
    return JSON.stringify(results, null, 2);
  }
}
