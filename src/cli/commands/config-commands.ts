/**
 * Configuration-related commands
 *
 * - init: Initialize claudelint configuration
 * - print-config: Print resolved configuration
 * - resolve-config: Show effective configuration for a specific file
 * - validate-config: Validate configuration file
 */

import { Command } from 'commander';
import { InitWizard } from '../init-wizard';
import { ConfigDebugger } from '../config-debug';

/**
 * Register all configuration-related commands
 *
 * @param program - Commander program instance
 */
export function registerConfigCommands(program: Command): void {
  // init command
  program
    .command('init')
    .description('Initialize claudelint configuration')
    .option('-y, --yes', 'Use default configuration without prompts')
    .option('--force', 'Overwrite existing configuration files')
    .action(async (options: { yes?: boolean; force?: boolean }) => {
      const wizard = new InitWizard();
      await wizard.run(options);
    });

  // print-config command
  program
    .command('print-config')
    .description('Print resolved configuration')
    .option('--format <format>', 'Output format: json, table (default: json)', 'json')
    .option('--config <path>', 'Path to config file')
    .action((options: { format?: 'json' | 'table'; config?: string }) => {
      ConfigDebugger.printConfig({ format: options.format, configPath: options.config });
    });

  // resolve-config command
  program
    .command('resolve-config <file>')
    .description('Show effective configuration for a specific file')
    .option('--format <format>', 'Output format: json, table (default: json)', 'json')
    .option('--config <path>', 'Path to config file')
    .action((file: string, options: { format?: 'json' | 'table'; config?: string }) => {
      ConfigDebugger.resolveConfigForFile(file, {
        format: options.format,
        configPath: options.config,
      });
    });

  // validate-config command
  program
    .command('validate-config')
    .description('Validate configuration file')
    .option('--config <path>', 'Path to config file')
    .action((options: { config?: string }) => {
      ConfigDebugger.validateConfig(options.config);
    });
}
