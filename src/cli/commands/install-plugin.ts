/**
 * install-plugin command - Show instructions for installing claudelint plugin
 */

import { Command } from 'commander';
import { logger } from '../utils/logger';
import chalk from 'chalk';

/**
 * Register the install-plugin command
 *
 * @param program - Commander program instance
 */
export function registerInstallPluginCommand(program: Command): void {
  program
    .command('install-plugin')
    .description('Show instructions for installing claudelint plugin in Claude Code')
    .action(() => {
      logger.newline();
      logger.section('Install claudelint plugin in Claude Code');
      logger.newline();

      logger.log(chalk.bold('Option 1: Load directly (development/testing)'));
      logger.newline();
      logger.log(chalk.cyan('  claude --plugin-dir ./node_modules/claude-code-lint'));
      logger.newline();

      logger.log(chalk.bold('Option 2: Install from a marketplace'));
      logger.newline();
      logger.log(chalk.cyan('  /plugin install claudelint@marketplace-name'));
      logger.newline();
      logger.log(chalk.dim('  See https://code.claude.com/docs/en/discover-plugins for details.'));
      logger.newline();

      logger.log(chalk.bold('After loading, skills will be available:'));
      logger.newline();
      logger.detail('/claudelint:validate-all    - Validate all project files');
      logger.detail('/claudelint:validate-cc-md  - Validate CLAUDE.md files');
      logger.detail('/claudelint:validate-skills - Validate skills structure');
      logger.detail('/claudelint:format-cc       - Format Claude Code files');
      logger.newline();
      logger.info('See all skills: /skills (filter by "claudelint")');
      logger.newline();

      process.exit(0);
    });
}
