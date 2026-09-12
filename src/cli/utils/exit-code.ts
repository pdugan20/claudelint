/**
 * Exit-code policy for the check commands.
 *
 * Both the stdin path and the filesystem path in `check-all` route through this so the two
 * cannot disagree: the stdin path previously computed its own code and consulted neither
 * `--strict`, `--max-warnings`, nor `--error-on-deprecated`, so piped content reported its
 * problems and still exited 0.
 */

/** Totals and flags that determine whether a run failed */
export interface ExitCodeInput {
  /** Errors reported across all validators */
  totalErrors: number;
  /** Warnings reported across all validators */
  totalWarnings: number;
  /** True when `--error-on-deprecated` is set and a deprecated rule was used */
  hasDeprecatedRules?: boolean;
  /** Warning budget from `--max-warnings` or config; negative means unlimited */
  maxWarnings?: number;
  /** `--strict`: any problem fails the run */
  strict?: boolean;
  /** `--warnings-as-errors`: warnings fail the run */
  warningsAsErrors?: boolean;
}

/**
 * Decides the process exit code for a completed run.
 *
 * @param input - Problem totals and the flags that promote them to failures
 * @returns 1 when the run should fail, 0 otherwise
 */
export function resolveExitCode(input: ExitCodeInput): 0 | 1 {
  const {
    totalErrors,
    totalWarnings,
    hasDeprecatedRules = false,
    maxWarnings = -1,
    strict = false,
    warningsAsErrors = false,
  } = input;

  if (hasDeprecatedRules) {
    return 1;
  }

  if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
    return 1;
  }

  if (strict && (totalErrors > 0 || totalWarnings > 0)) {
    return 1;
  }

  if (totalErrors > 0) {
    return 1;
  }

  if (totalWarnings > 0 && warningsAsErrors) {
    return 1;
  }

  return 0;
}
