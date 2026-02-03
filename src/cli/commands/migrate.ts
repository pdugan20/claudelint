/**
 * migrate command - Migrate deprecated rules in config files
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { findConfigFile } from '../../utils/config/types';
import { logger } from '../utils/logger';
import { migrateConfig, type MigrationResult } from '../../utils/migrate/update-configs';

/**
 * Register the migrate command
 *
 * @param program - Commander program instance
 */
export function registerMigrateCommand(program: Command): void {
  program
    .command('migrate')
    .description('Migrate deprecated rules in config files')
    .option('--config <path>', 'Path to config file (default: auto-detect)')
    .option('--dry-run', 'Show changes without writing to file')
    .option('--format <format>', 'Output format: table, json (default: table)')
    .action((options: { config?: string; dryRun?: boolean; format?: string }): void => {
      try {
        // Find config file
        let configPath: string | null = null;

        if (options.config) {
          configPath = options.config;
        } else {
          configPath = findConfigFile(process.cwd());
        }

        if (!configPath) {
          logger.newline();
          logger.warn('No configuration file found.');
          logger.log('Run "claudelint init" to create a configuration file.');
          logger.newline();
          process.exit(0);
        }

        // Run migration
        const result: MigrationResult = migrateConfig(configPath, options.dryRun);

        // Output results
        if (options.format === 'json') {
          logger.log(JSON.stringify(result, null, 2));
          process.exit(result.success ? 0 : 2);
        }

        // Table format (default)
        logger.newline();

        if (result.changes.length === 0) {
          logger.success('No deprecated rules found in your configuration!');
          logger.newline();
          process.exit(0);
        }

        // Show header
        if (result.dryRun) {
          logger.info(`Migration preview for: ${configPath}`);
          logger.detail('(Dry run - no changes will be written)');
        } else {
          logger.info(`Migrating config: ${configPath}`);
        }
        logger.newline();

        // Show changes
        const replaced = result.changes.filter((c) => c.action === 'replaced');
        const manual = result.changes.filter((c) => c.action === 'manual');

        if (replaced.length > 0) {
          logger.success(`${replaced.length} rule(s) will be replaced:`);
          logger.newline();

          for (const change of replaced) {
            logger.log(
              `  ${chalk.red(change.oldRuleId)} ${chalk.gray('\u2192')} ${chalk.green(change.newRuleId)}`
            );
            logger.detail(chalk.gray(`Reason: ${change.reason}`));
            logger.newline();
          }
        }

        if (manual.length > 0) {
          logger.warn(`${manual.length} rule(s) require manual intervention:`);
          logger.newline();

          for (const change of manual) {
            logger.warn(change.oldRuleId);
            logger.detail(chalk.gray(`Reason: ${change.reason}`));
            logger.newline();
          }
        }

        // Show warnings
        if (result.warnings.length > 0) {
          logger.warn('Warnings:');
          for (const warning of result.warnings) {
            logger.detail(warning);
          }
          logger.newline();
        }

        // Show next steps
        if (result.dryRun && replaced.length > 0) {
          logger.log(chalk.bold('Next steps:'));
          logger.detail('1. Run without --dry-run to apply changes');
          logger.detail('2. Review the updated config file');
          logger.detail('3. Run validation to test the new configuration');
        } else if (!result.dryRun && replaced.length > 0) {
          logger.success(`Config migrated successfully!`);
          logger.newline();
          logger.log(chalk.bold('Next steps:'));
          logger.detail('1. Review the updated config file');
          logger.detail('2. Run validation to test the new configuration');
        }

        if (manual.length > 0) {
          logger.detail(
            `${manual.length + (replaced.length > 0 ? '. ' : '1. ')}Manually update rules requiring intervention`
          );
        }

        logger.newline();

        // Exit code
        if (!result.success) {
          process.exit(2);
        } else if (manual.length > 0) {
          process.exit(1); // Manual intervention needed
        } else {
          process.exit(0);
        }
      } catch (error: unknown) {
        logger.newline();
        logger.error('Error during migration:');
        logger.error(error instanceof Error ? error.message : String(error));
        logger.newline();
        process.exit(2);
      }
    });
}
