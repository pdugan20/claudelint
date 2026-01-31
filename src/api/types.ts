/**
 * Type definitions for claude-code-lint programmatic API
 *
 * This module contains all public type definitions for the API, including
 * result types, message types, and configuration options.
 *
 * @module api/types
 */

import { ClaudeLintConfig } from '../utils/config';

/**
 * Information about an automatic fix that can be applied
 */
export interface FixInfo {
  /** Start and end offsets in the source code [start, end] */
  range: [number, number];
  /** Replacement text to insert */
  text: string;
}

/**
 * Information about a suggested fix
 */
export interface SuggestionInfo {
  /** Description of what this suggestion does */
  desc: string;
  /** The suggested fix */
  fix: FixInfo;
}

/**
 * Individual validation message for a specific issue
 */
export interface LintMessage {
  /** Unique identifier for the rule that triggered this message */
  ruleId: string | null;

  /** Severity level of the message */
  severity: 'error' | 'warning';

  /** Human-readable message describing the issue */
  message: string;

  /** Line number where the issue occurred (1-based) */
  line?: number;

  /** Column number where the issue occurred (1-based) */
  column?: number;

  /** Line number where the issue ends (1-based) */
  endLine?: number;

  /** Column number where the issue ends (1-based) */
  endColumn?: number;

  /** Automatic fix that can be applied (if fixable) */
  fix?: FixInfo;

  /** Alternative fix suggestions */
  suggestions?: SuggestionInfo[];

  /** Detailed explanation of why this issue matters */
  explanation?: string;

  /** Step-by-step instructions on how to fix the issue */
  howToFix?: string;
}

/**
 * Complete validation result for a single file
 */
export interface LintResult {
  /** Absolute path to the file that was linted */
  filePath: string;

  /** Array of validation messages for this file */
  messages: LintMessage[];

  /** Messages that were suppressed via inline comments */
  suppressedMessages: LintMessage[];

  /** Number of error-level messages */
  errorCount: number;

  /** Number of warning-level messages */
  warningCount: number;

  /** Number of errors that can be automatically fixed */
  fixableErrorCount: number;

  /** Number of warnings that can be automatically fixed */
  fixableWarningCount: number;

  /** Original source code (if available) */
  source?: string;

  /** Fixed source code (if fixes were applied) */
  output?: string;

  /** Performance and diagnostic statistics */
  stats?: {
    /** Time taken to validate this file in milliseconds */
    validationTime: number;
  };
}

/**
 * Options for the main ClaudeLint class constructor
 */
export interface ClaudeLintOptions {
  // Configuration
  /** Explicit configuration object (overrides config file) */
  config?: ClaudeLintConfig;

  /** Path to configuration file (overrides automatic discovery) */
  overrideConfigFile?: string;

  // Linting behavior
  /** Enable automatic fixing of issues (boolean or predicate function) */
  fix?: boolean | ((message: LintMessage) => boolean);

  /** Types of fixes to apply (e.g., ['problem', 'suggestion']) */
  fixTypes?: string[];

  /** Allow inline disable comments (default: true) */
  allowInlineConfig?: boolean;

  /** Warn about unused disable directives */
  reportUnusedDisableDirectives?: boolean;

  // File handling
  /** Current working directory (default: process.cwd()) */
  cwd?: string;

  /** Enable ignore patterns from config (default: true) */
  ignore?: boolean;

  /** Additional ignore patterns (glob patterns) */
  ignorePatterns?: string[];

  /** Throw error if glob patterns don't match any files */
  errorOnUnmatchedPattern?: boolean;

  // Caching
  /** Enable result caching for better performance */
  cache?: boolean;

  /** Directory to store cache files (default: '.claude-code-lint-cache') */
  cacheLocation?: string;

  /** Cache invalidation strategy ('metadata' | 'content') */
  cacheStrategy?: 'metadata' | 'content';

  // Progress callbacks
  /** Called when linting starts with total file count */
  onStart?: (fileCount: number) => void;

  /** Called for each file during linting */
  onProgress?: (file: string, index: number, total: number) => void;

  /** Called when linting completes with all results */
  onComplete?: (results: LintResult[]) => void;

  // Filtering
  /** Filter which rules to run (return true to include) */
  ruleFilter?: (ruleId: string) => boolean;
}

/**
 * Options for linting files
 */
export interface LintOptions extends ClaudeLintOptions {
  // Inherits all ClaudeLintOptions
}

/**
 * Options for linting text content
 */
export interface LintTextOptions {
  /** Virtual file path for config resolution and rule application */
  filePath?: string;

  /** Warn if the file path would be ignored by config */
  warnIgnored?: boolean;
}

/**
 * Information about a file (without linting it)
 */
export interface FileInfo {
  /** Whether this file would be ignored by configuration */
  ignored: boolean;

  /** Names of validators that would run on this file */
  validators: string[];
}

/**
 * Options for resolving configuration
 */
export interface ConfigOptions {
  /** Working directory to start search from */
  cwd?: string;
}

/**
 * Options for loading a formatter
 */
export interface LoadFormatterOptions {
  /** Working directory for resolving formatter paths */
  cwd?: string;
}

/**
 * Options for getting file information
 */
export interface FileInfoOptions {
  /** Working directory for path resolution */
  cwd?: string;
}

/**
 * Formatter interface for formatting lint results
 */
export interface Formatter {
  /**
   * Format lint results into a string
   * @param results - Array of lint results to format
   * @returns Formatted output as a string
   */
  format(results: LintResult[]): string;
}

/**
 * Options for formatter instances
 */
export interface FormatterOptions {
  /** Working directory for path resolution in output */
  cwd?: string;

  /** Enable color output (if formatter supports it) */
  color?: boolean;
}

/**
 * Metadata about a validation rule
 */
export interface RuleMetadata {
  /** Unique identifier for the rule */
  ruleId: string;

  /** Brief description of what the rule checks */
  description: string;

  /** Category the rule belongs to */
  category: string;

  /** Default severity level */
  severity: 'error' | 'warning';

  /** Whether the rule can automatically fix issues */
  fixable: boolean;

  /** Detailed explanation of the rule */
  explanation?: string;

  /** Documentation URL for the rule */
  docs?: string;
}
