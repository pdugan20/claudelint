/**
 * CLI Logger Utility
 *
 * Provides consistent, colored output formatting for all CLI commands.
 * Uses chalk for colors and proper output streams (stderr for errors).
 *
 * Industry standard pattern (Prettier/ESLint style):
 * - No Unicode symbols, just clean colored text
 * - Proper output streams (stderr for errors/warnings)
 * - No manual newline management
 * - Professional and minimal
 *
 * Indentation convention (matching ESLint):
 * - Use 2 spaces ('  ') for detail/sub-information lines
 * - Always use logger.log() for indented content
 * - Example:
 *   logger.info('Running checks...');
 *   logger.log('  File: example.ts');
 *   logger.log('  Status: passed');
 *
 * @example
 * ```typescript
 * import { logger } from './cli/utils/logger';
 *
 * logger.success('All checks passed');
 * logger.error('Validation failed');
 * logger.warn('Optional tool not found');
 * logger.info('Running checks...');
 * logger.log('  Details: ...');  // 2 spaces for indentation
 * ```
 */

import chalk from 'chalk';

/**
 * Logger utility for consistent CLI output
 *
 * Follows Prettier/ESLint minimal style:
 * - No Unicode symbols
 * - Just colored text
 * - Clean and professional
 */
export const logger = {
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
   * Info message (blue text)
   * Uses stdout
   */
  info: (msg: string): void => {
    console.log(chalk.blue(msg));
  },

  /**
   * Section header (bold with spacing)
   * Uses stdout
   */
  section: (msg: string): void => {
    console.log(chalk.bold(`\n${msg}\n`));
  },

  /**
   * Plain message without formatting
   * Uses stdout
   */
  log: (msg: string): void => {
    console.log(msg);
  },

  /**
   * Blank line for spacing
   */
  newline: (): void => {
    console.log();
  },
};
