/**
 * Option builder functions
 *
 * Composable functions that register option groups on Commander commands.
 * Groups map directly to help text categories in CLI help output.
 *
 * Usage:
 *   const cmd = program.command('check-all');
 *   addCommonOptions(cmd);
 *   addOutputOptions(cmd);
 *   addEnforcementOptions(cmd);
 */

import { Command } from 'commander';

/**
 * Add common options shared by all commands
 *
 * Registers: -v/--verbose, -c/--config, --no-config, --debug-config,
 * --warnings-as-errors, --max-warnings
 */
export function addCommonOptions(cmd: Command): Command {
  return cmd
    .option('-v, --verbose', 'Verbose output')
    .option('-c, --config <path>', 'Path to config file')
    .option('--no-config', 'Disable configuration file loading')
    .option('--debug-config', 'Show configuration loading debug information')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('--max-warnings <number>', 'Fail if warning count exceeds limit', parseInt)
    .option(
      '--rule <rule:severity>',
      'Override rule severity (repeatable, e.g., --rule size-error:off)',
      collectValues,
      []
    );
}

/**
 * Collect repeated option values into an array
 */
function collectValues(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

/**
 * Add output formatting options
 *
 * Registers: --format, -q/--quiet, --color/--no-color, --explain,
 * --no-collapse, --timing, --show-docs-url
 */
export function addOutputOptions(cmd: Command): Command {
  return cmd
    .option(
      '--format <format>',
      'Output format: stylish, json, compact, sarif, github (default: stylish)'
    )
    .option('-o, --output-file <path>', 'Write results to file')
    .option('-q, --quiet', 'Suppress warnings, show only errors')
    .option('--color', 'Force color output')
    .option('--no-color', 'Disable color output')
    .option('--explain', 'Show detailed explanations and fix suggestions')
    .option('--no-collapse', 'Show all issues without collapsing repeated rules')
    .option('--timing', 'Show per-validator timing breakdown')
    .option('--show-docs-url', 'Show documentation URLs for rules')
    .option('--stats', 'Include per-rule statistics in output');
}

/**
 * Add enforcement options
 *
 * Registers: --strict, --no-deprecated-warnings, --error-on-deprecated,
 * --allow-empty-input
 */
export function addEnforcementOptions(cmd: Command): Command {
  return cmd
    .option('--strict', 'Exit with error on any issues (errors, warnings, or info)')
    .option('--no-deprecated-warnings', 'Suppress warnings about deprecated rules')
    .option('--error-on-deprecated', 'Treat usage of deprecated rules as errors')
    .option('--allow-empty-input', 'Exit 0 when no files to check (useful with lint-staged)');
}

/**
 * Add cache options
 *
 * Registers: --cache, --no-cache, --cache-location
 */
export function addCacheOptions(cmd: Command): Command {
  return cmd
    .option('--cache', 'Enable caching (default: true)')
    .option('--no-cache', 'Disable caching')
    .option('--cache-location <path>', 'Cache directory', '.claudelint-cache')
    .option(
      '--cache-strategy <strategy>',
      'Cache invalidation strategy: metadata or content',
      'metadata'
    );
}

/**
 * Add auto-fix options
 *
 * Registers: --fix, --fix-dry-run, --fix-type
 */
export function addFixOptions(cmd: Command): Command {
  return cmd
    .option('--fix', 'Automatically fix problems')
    .option('--fix-dry-run', 'Preview fixes without applying them')
    .option('--fix-type <type>', 'Fix errors, warnings, or all', 'all');
}

/**
 * Add file selection options
 *
 * Registers: --ignore-pattern, --no-ignore, --changed, --since
 */
export function addFileSelectionOptions(cmd: Command): Command {
  return cmd
    .option(
      '--ignore-pattern <pattern>',
      'Additional pattern to ignore (repeatable)',
      collectValues,
      []
    )
    .option('--no-ignore', 'Disable ignore file and pattern processing')
    .option('--changed', 'Only check files with uncommitted changes')
    .option('--since <ref>', 'Only check files changed since git ref')
    .option('--stdin', 'Read input from stdin instead of files')
    .option(
      '--stdin-filename <path>',
      'Provide filename context for stdin input (e.g., CLAUDE.md)'
    );
}

/**
 * Add monorepo workspace options
 *
 * Registers: --workspace, --workspaces
 */
export function addWorkspaceOptions(cmd: Command): Command {
  return cmd
    .option(
      '--workspace <name>',
      'Validate specific workspace package by name (works from any directory)'
    )
    .option('--workspaces', 'Validate all workspace packages (works from any directory)');
}
