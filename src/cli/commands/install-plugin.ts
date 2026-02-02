/**
 * install-plugin command - Show instructions for installing claudelint plugin
 */

import { Command } from 'commander';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import { join } from 'path';
import { existsSync } from 'fs';

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
      const cwd = process.cwd();
      const nodeModulesPath = join(cwd, 'node_modules', 'claude-code-lint');
      const isProjectInstall = existsSync(nodeModulesPath);

      logger.newline();
      logger.section('Install claudelint plugin in Claude Code');
      logger.newline();

      if (isProjectInstall) {
        logger.info('Detected project installation in node_modules');
        logger.newline();
        logger.log(chalk.bold('Run this command in your Claude Code session:'));
        logger.newline();
        logger.log(chalk.cyan('  /plugin install --source ./node_modules/claude-code-lint'));
        logger.newline();
      } else {
        logger.info('No project installation detected');
        logger.newline();
        logger.log(chalk.bold('Option 1: Install from GitHub (recommended)'));
        logger.newline();
        logger.log(chalk.cyan('  /plugin install github:pdugan20/claudelint'));
        logger.newline();
        logger.log(chalk.bold('Option 2: Install from npm first, then:'));
        logger.newline();
        logger.log(chalk.dim('  npm install --save-dev claude-code-lint'));
        logger.log(chalk.cyan('  /plugin install --source ./node_modules/claude-code-lint'));
        logger.newline();
      }

      logger.log(chalk.bold('After installation, skills will be available:'));
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
