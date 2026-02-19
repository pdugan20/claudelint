/**
 * install-plugin command - Guided setup for installing claudelint plugin in Claude Code
 */

import { Command } from 'commander';
import { logger } from '../utils/logger';
import chalk from 'chalk';
import { execSync } from 'child_process';

function isGloballyInstalled(): boolean {
  try {
    execSync('command -v claudelint', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isLocallyInstalled(): boolean {
  try {
    execSync('npx --no-install claudelint --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getInstalledVersion(): string | null {
  try {
    return execSync('claudelint --version', { encoding: 'utf-8' }).trim();
  } catch {
    try {
      return execSync('npx --no-install claudelint --version', { encoding: 'utf-8' }).trim();
    } catch {
      return null;
    }
  }
}

/**
 * Register the install-plugin command
 *
 * @param program - Commander program instance
 */
export function registerInstallPluginCommand(program: Command): void {
  program
    .command('install-plugin')
    .description('Show guided setup for installing claudelint plugin in Claude Code')
    .option('--json', 'Output as JSON for programmatic consumption')
    .action((options: { json?: boolean }) => {
      if (options.json) {
        outputJson();
        return;
      }

      const globalInstall = isGloballyInstalled();
      const localInstall = isLocallyInstalled();
      const version = getInstalledVersion();

      logger.newline();
      logger.section('claudelint Plugin Setup');
      logger.newline();

      // Step 1: npm package
      logger.log(chalk.bold('Step 1: Install the npm package'));
      logger.newline();

      if (globalInstall) {
        logger.detail(
          `${chalk.green('[INSTALLED]')} claudelint is globally available (${version})`
        );
      } else if (localInstall) {
        logger.detail(`${chalk.green('[INSTALLED]')} claudelint is available locally (${version})`);
        logger.detail(chalk.dim('For use across all projects, also install globally:'));
        logger.detail(chalk.cyan('npm install -g claude-code-lint'));
      } else {
        logger.detail('Choose how to install:');
        logger.newline();
        logger.detail(
          `${chalk.bold('All projects (recommended):')}  ${chalk.cyan('npm install -g claude-code-lint')}`
        );
        logger.detail(
          `${chalk.bold('This project only:')}            ${chalk.cyan('npm install --save-dev claude-code-lint')}`
        );
      }

      logger.newline();

      // Step 2: plugin install
      logger.log(chalk.bold('Step 2: Install the Claude Code plugin'));
      logger.newline();
      logger.detail(chalk.bold('From the marketplace (recommended):'));
      logger.newline();
      logger.detail(`${chalk.dim('1.')} Add the marketplace (one-time):`);
      logger.detail(chalk.cyan('   /plugin marketplace add pdugan20/claudelint'));
      logger.newline();
      logger.detail(`${chalk.dim('2.')} Install the plugin:`);
      logger.detail(chalk.cyan('   /plugin install claudelint@pdugan20-plugins'));
      logger.newline();
      logger.detail('Choose your scope when prompted:');
      logger.detail(
        `  ${chalk.bold('User')} ${chalk.dim('(default, recommended)')} - available in all your projects`
      );
      logger.detail(
        `  ${chalk.bold('Project')}                      - shared with collaborators via .claude/settings.json`
      );
      logger.detail(`  ${chalk.bold('Local')}                        - only you, only this repo`);
      logger.newline();
      logger.detail(chalk.bold('For development/testing:'));
      logger.detail(chalk.cyan('claude --plugin-dir ./node_modules/claude-code-lint'));
      logger.newline();

      // Step 3: auto-update
      logger.log(chalk.bold('Step 3: Enable auto-updates'));
      logger.newline();
      logger.detail('Third-party marketplace plugins do not auto-update by default.');
      logger.detail('To enable, inside Claude Code:');
      logger.detail(chalk.cyan('/plugin > Marketplaces > pdugan20-plugins > Enable auto-update'));
      logger.newline();

      // Step 4: verify
      logger.log(chalk.bold('Step 4: Verify'));
      logger.newline();
      logger.detail('Run inside Claude Code:');
      logger.detail(chalk.cyan('/validate-all'));
      logger.newline();

      // Skills reference
      logger.log(chalk.bold('Available skills:'));
      logger.newline();
      logger.detail('/validate-all    - Validate all project files');
      logger.detail('/validate-cc-md  - Validate CLAUDE.md files');
      logger.detail('/validate-skills - Validate skills structure');
      logger.detail('/format-cc       - Format Claude Code files');
      logger.detail('/optimize-cc-md  - Interactively optimize CLAUDE.md');
      logger.newline();
      logger.info('See all skills: /skills (filter by "claudelint")');
      logger.newline();

      process.exit(0);
    });
}

function outputJson(): void {
  const json = {
    npm: {
      global: 'npm install -g claude-code-lint',
      local: 'npm install --save-dev claude-code-lint',
    },
    plugin: {
      marketplace: {
        add: '/plugin marketplace add pdugan20/claudelint',
        install: '/plugin install claudelint@pdugan20-plugins',
      },
      development: 'claude --plugin-dir ./node_modules/claude-code-lint',
    },
    autoUpdate: '/plugin > Marketplaces > pdugan20-plugins > Enable auto-update',
    verify: '/validate-all',
    status: {
      globalInstall: isGloballyInstalled(),
      localInstall: isLocallyInstalled(),
      version: getInstalledVersion(),
    },
  };
  process.stdout.write(JSON.stringify(json, null, 2) + '\n');
  process.exit(0);
}
