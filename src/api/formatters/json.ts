/**
 * JSON formatter - Machine-readable JSON output
 *
 * Outputs lint results as JSON, useful for tooling integration
 * and programmatic processing.
 *
 * @packageDocumentation
 */

import { LintResult, Formatter } from '../types';

/** JSON output formatter */
export class JsonFormatter implements Formatter {
  /** Format lint results as a JSON string */
  format(results: LintResult[]): string {
    return JSON.stringify(results, null, 2);
  }
}
