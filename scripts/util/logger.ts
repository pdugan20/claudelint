/**
 * Script Logger Utility
 *
 * Provides consistent, colored output formatting for all scripts.
 * Similar to CLI logger but tailored for developer tooling needs.
 *
 * Key differences from CLI logger:
 * - Shorter import path (../util/logger vs ../../src/cli/utils/logger)
 * - Additional helpers: dim, divider, pass/fail, bracket prefixes
 * - Designed for script output patterns (status checks, validation reports)
 *
 * @example
 * ```typescript
 * import { log } from '../util/logger';
 *
 * log.section('Schema Sync Verification');
 * log.info('Generating schemas...');
 * log.pass('All schemas match');           // ✓ All schemas match
 * log.bracket.success('Validation passed'); // [SUCCESS] Validation passed
 * ```
 */

import chalk from 'chalk';

export const log = {
  /**
   * Success message (green text)
   * Uses stdout
   */
  success: (msg: string): void => {
    console.log(chalk.green(msg));
  },

  /**
   * Error message (red text)
   * Uses stderr
   */
  error: (msg: string): void => {
    console.error(chalk.red(msg));
  },

  /**
   * Warning message (yellow text)
   * Uses stderr
   */
  warn: (msg: string): void => {
    console.warn(chalk.yellow(msg));
  },

  /**
   * Info message (plain text)
   * Uses stdout
   */
  info: (msg: string): void => {
    console.log(msg);
  },

  /**
   * Dimmed/gray text for secondary information
   * Uses stdout
   */
  dim: (msg: string): void => {
    console.log(chalk.gray(msg));
  },

  /**
   * Bold text for emphasis
   * Uses stdout
   */
  bold: (msg: string): void => {
    console.log(chalk.bold(msg));
  },

  /**
   * Section header (bold with spacing)
   * Uses stdout
   */
  section: (msg: string): void => {
    console.log(chalk.bold(`\n${msg}\n`));
  },

  /**
   * Blank line for spacing
   */
  blank: (): void => {
    console.log();
  },

  /**
   * Horizontal divider line
   */
  divider: (): void => {
    console.log('='.repeat(80));
  },

  /**
   * Success with checkmark symbol (✓)
   * Uses stdout
   */
  pass: (msg: string): void => {
    console.log(chalk.green(`✓ ${msg}`));
  },

  /**
   * Error with cross symbol (✗)
   * Uses stderr
   */
  fail: (msg: string): void => {
    console.error(chalk.red(`✗ ${msg}`));
  },

  /**
   * Bracket-style status prefixes
   * Common pattern for final script status
   */
  bracket: {
    success: (msg: string): void => {
      console.log(chalk.green(`[SUCCESS] ${msg}`));
    },
    fail: (msg: string): void => {
      console.error(chalk.red(`[FAIL] ${msg}`));
    },
    error: (msg: string): void => {
      console.error(chalk.red(`[ERROR] ${msg}`));
    },
    warn: (msg: string): void => {
      console.log(chalk.yellow(`[WARN] ${msg}`));
    },
  },
};
