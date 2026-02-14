/**
 * Reporter options builder
 *
 * Encapsulates CLI-to-Reporter option mapping with correct merge logic.
 * Eliminates manual inline mapping that's bug-prone and inconsistent.
 *
 * Merge strategy:
 * - CLI flags take precedence over config values
 * - Boolean negation flags (--no-X) are normalized
 * - Undefined CLI values fall through to config defaults
 */

import { ReportingOptions } from '../../utils/reporting/reporting';
import { CommonOptions, OutputOptions } from '../types';
import { ClaudeLintConfig } from '../../utils/config/types';

/**
 * Build ReportingOptions from CLI flags and loaded config
 *
 * @param cliOptions - Parsed CLI options (CommonOptions + OutputOptions at minimum)
 * @param config - Loaded and validated config object
 * @returns ReportingOptions ready to pass to `new Reporter()`
 */
export function buildReporterOptions(
  cliOptions: CommonOptions & Partial<OutputOptions> & { errorOnDeprecated?: boolean },
  config?: ClaudeLintConfig
): ReportingOptions {
  const configOutput = config?.output ?? {};

  return {
    verbose: cliOptions.verbose ?? configOutput.verbose,
    quiet: cliOptions.quiet,
    warningsAsErrors: cliOptions.warningsAsErrors,
    explain: cliOptions.explain,
    format: cliOptions.format ?? configOutput.format,
    color: cliOptions.color ?? configOutput.color,
    showDocsUrl: cliOptions.showDocsUrl,
    deprecatedWarnings: cliOptions.deprecatedWarnings !== false,
    errorOnDeprecated: cliOptions.errorOnDeprecated,
    collapseRepetitive: cliOptions.collapse !== false && configOutput.collapseRepetitive !== false,
  };
}
