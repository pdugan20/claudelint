/**
 * check-deprecated command - Check for deprecated rules in config
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { RuleRegistry } from '../../utils/rules/registry';
import { findConfigFile, loadConfig } from '../../utils/config/types';
import { logger } from '../utils/logger';
import { isRuleDeprecated, getDeprecationInfo, getReplacementRuleIds } from '../../types/rule';

/**
 * Register the check-deprecated command
 *
 * @param program - Commander program instance
 */
export function registerCheckDeprecatedCommand(program: Command): void {
  program
    .command('check-deprecated')
    .description('Check configuration for deprecated rules')
    .option('--config <path>', 'Path to config file (default: auto-detect)')
    .option('--format <format>', 'Output format: table, json (default: table)')
    .action((options: { config?: string; format?: string }) => {
      try {
        // Load configuration
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

        const config = loadConfig(configPath);

        if (!config.rules || Object.keys(config.rules).length === 0) {
          logger.newline();
          logger.info('No rules configured in your config file.');
          logger.newline();
          process.exit(0);
        }

        // Find deprecated rules in config
        const deprecatedRulesInConfig: Array<{
          ruleId: string;
          reason: string;
          replacedBy?: string[];
          deprecatedSince?: string;
          removeInVersion?: string | null;
          url?: string;
        }> = [];

        for (const ruleId of Object.keys(config.rules)) {
          const rule = RuleRegistry.getRule(ruleId);

          if (rule && isRuleDeprecated(rule)) {
            const info = getDeprecationInfo(rule);
            if (info) {
              deprecatedRulesInConfig.push({
                ruleId,
                reason: info.reason,
                replacedBy: info.replacedBy ? getReplacementRuleIds(rule) : undefined,
                deprecatedSince: info.deprecatedSince,
                removeInVersion: info.removeInVersion,
                url: info.url,
              });
            }
          }
        }

        // Output results
        if (options.format === 'json') {
          logger.log(
            JSON.stringify(
              {
                configFile: configPath,
                deprecatedRulesCount: deprecatedRulesInConfig.length,
                deprecatedRules: deprecatedRulesInConfig,
              },
              null,
              2
            )
          );
          process.exit(deprecatedRulesInConfig.length > 0 ? 1 : 0);
        }

        // Table format (default)
        logger.newline();
        if (deprecatedRulesInConfig.length === 0) {
          logger.success('No deprecated rules found in your configuration!');
          logger.newline();
          process.exit(0);
        }

        logger.warn(
          `Found ${deprecatedRulesInConfig.length} deprecated rule(s) in your configuration:`
        );
        logger.newline();

        for (const rule of deprecatedRulesInConfig) {
          // Rule ID
          logger.warn(rule.ruleId);

          // Reason
          logger.detail(chalk.gray(`Reason: ${rule.reason}`));

          // Replacement
          if (rule.replacedBy && rule.replacedBy.length > 0) {
            logger.detail(chalk.cyan(`Use: ${rule.replacedBy.join(', ')}`));
          }

          // Version information
          if (rule.deprecatedSince) {
            logger.detail(chalk.gray(`Deprecated since: ${rule.deprecatedSince}`));
          }

          if (rule.removeInVersion) {
            logger.detail(chalk.red(`Will be removed in: ${rule.removeInVersion}`));
          } else if (rule.removeInVersion === null) {
            logger.detail(chalk.gray('Retained indefinitely for compatibility'));
          }

          // Migration guide
          if (rule.url) {
            logger.detail(chalk.blue(`Migration guide: ${rule.url}`));
          }

          logger.newline();
        }

        logger.log(chalk.bold('Migration steps:'));
        logger.detail('1. Update your config file to replace deprecated rules');
        logger.detail('2. Run validation to test the new configuration');
        logger.detail('3. Remove deprecated rule entries from config');
        logger.newline();

        // Exit with error code if deprecated rules found
        process.exit(1);
      } catch (error: unknown) {
        logger.newline();
        logger.error('Error checking deprecated rules:');
        logger.error(error instanceof Error ? error.message : String(error));
        logger.newline();
        process.exit(2);
      }
    });
}
