/**
 * Shared CLI option types
 *
 * Single source of truth for all CLI command option interfaces.
 * Commands import these instead of defining inline anonymous types.
 *
 * Design: composition over inheritance. Smaller interfaces compose
 * into command-specific types via intersection.
 */

import { OutputFormat } from '../utils/reporting/reporting';

/**
 * Options common to all commands
 *
 * Every CLI command that loads config and reports results uses these.
 */
export interface CommonOptions {
  cwd?: string;
  verbose?: boolean;
  config?: string | false; // Commander sets to false when --no-config is used
  preset?: string; // Built-in preset to use when no config found (default: recommended)
  debugConfig?: boolean;
  warningsAsErrors?: boolean;
  maxWarnings?: number;
}

/**
 * Output formatting options
 *
 * Controls how validation results are displayed.
 */
export interface OutputOptions {
  format?: OutputFormat;
  color?: boolean;
  quiet?: boolean;
  explain?: boolean;
  showDocsUrl?: boolean;
  deprecatedWarnings?: boolean;
  collapse?: boolean;
  timing?: boolean;
  outputFile?: string;
  stats?: boolean;
}

/**
 * Enforcement options
 *
 * Controls strictness and exit code behavior.
 */
export interface EnforcementOptions {
  strict?: boolean;
  errorOnDeprecated?: boolean;
  allowEmptyInput?: boolean;
}

/**
 * Cache options
 */
export interface CacheOptions {
  cache?: boolean;
  cacheLocation?: string;
  cacheStrategy?: 'metadata' | 'content';
}

/**
 * Auto-fix options
 */
export interface FixOptions {
  fix?: boolean;
  fixDryRun?: boolean;
  fixType?: 'errors' | 'warnings' | 'all';
}

/**
 * File selection options
 *
 * Controls which files are included/excluded from validation.
 */
export interface FileSelectionOptions {
  ignorePattern?: string[];
  ignore?: boolean; // Commander sets to false when --no-ignore is used
  changed?: boolean;
  since?: string;
  stdin?: boolean;
  stdinFilename?: string;
}

/**
 * Monorepo workspace options
 */
export interface WorkspaceOptions {
  workspace?: string;
  workspaces?: boolean;
}

/**
 * Full check-all command options
 *
 * Composition of all option groups plus check-all-specific flags.
 */
export interface CheckAllOptions
  extends
    CommonOptions,
    OutputOptions,
    EnforcementOptions,
    CacheOptions,
    FixOptions,
    FileSelectionOptions,
    WorkspaceOptions {
  fast?: boolean;
  rule?: string[];
}

/**
 * Validator command options (validate-claude-md, validate-skills, etc.)
 *
 * Subset of check-all options relevant to individual validators.
 */
export interface ValidatorOptions extends CommonOptions {
  path?: string;
  explain?: boolean;
  skill?: string;
  collapse?: boolean;
}

/**
 * Watch command options
 */
export interface WatchOptions extends CommonOptions {
  debounce?: string;
}
