/**
 * Config Debugging Utilities
 *
 * Helps users debug configuration issues by:
 * - Printing resolved configuration
 * - Showing effective config for specific files
 * - Validating config against rule registry
 */

import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import chalk from 'chalk';
import { loadConfig, findConfigFile, ClaudeLintConfig } from '../utils/config';
import { RuleRegistry } from '../utils/rule-registry';
import { logger } from './utils/logger';

export interface ConfigDebugOptions {
  format?: 'json' | 'yaml' | 'table';
  configPath?: string;
}

export class ConfigDebugger {
  /**
   * Print resolved configuration
   */
  static printConfig(options: ConfigDebugOptions = {}): void {
    const cwd = process.cwd();
    const configPath = options.configPath || findConfigFile(cwd);

    if (!configPath) {
      logger.warn('No configuration file found.');
      logger.newline();
      logger.log('Searched locations:');
      logger.log('  - .claudelintrc.json');
      logger.log('  - .claudelintrc.js');
      logger.log('  - package.json (claudelint key)');
      logger.newline();
      logger.info('Run "claudelint init" to create a configuration file.');
      process.exit(1);
    }

    if (!existsSync(configPath)) {
      logger.error(`Config file not found: ${configPath}`);
      process.exit(1);
    }

    const config = loadConfig(configPath);
    const format = options.format || 'json';

    logger.log(`Configuration loaded from: ${configPath}`);
    logger.newline();

    if (format === 'json') {
      logger.log(JSON.stringify(config, null, 2));
    } else if (format === 'table') {
      this.printConfigTable(config, configPath);
    } else {
      logger.error(`Unsupported format: ${format}`);
      process.exit(1);
    }
  }

  /**
   * Print config as a table (human-readable)
   */
  private static printConfigTable(config: ClaudeLintConfig, configPath: string): void {
    logger.log(chalk.bold('Configuration Summary:'));
    logger.log('='.repeat(60));
    logger.log(`Source: ${configPath}`);
    logger.newline();

    // Rules section
    if (config.rules && Object.keys(config.rules).length > 0) {
      logger.log('Rules:');
      logger.log('-'.repeat(60));
      const rules = Object.entries(config.rules).sort(([a], [b]) => a.localeCompare(b));
      for (const [ruleId, ruleConfig] of rules) {
        const rule = RuleRegistry.get(ruleId);
        const severity = typeof ruleConfig === 'string' ? ruleConfig : ruleConfig.severity;
        const status = severity === 'error' ? '✗' : severity === 'warn' ? '!' : '○';
        const category = rule ? `[${rule.category}]` : '';
        logger.log(`  ${status} ${ruleId.padEnd(30)} ${String(severity).padEnd(8)} ${category}`);
      }
      logger.newline();
    }

    // Output section
    if (config.output) {
      logger.log('Output:');
      logger.log('-'.repeat(60));
      logger.log(`  Format:  ${config.output.format || 'stylish'}`);
      logger.log(`  Verbose: ${config.output.verbose ? 'yes' : 'no'}`);
      logger.newline();
    }

    // Other options
    if (config.maxWarnings !== undefined) {
      logger.log('Limits:');
      logger.log('-'.repeat(60));
      logger.log(`  Max warnings: ${config.maxWarnings}`);
      logger.newline();
    }

    if (config.reportUnusedDisableDirectives !== undefined) {
      logger.log('Directives:');
      logger.log('-'.repeat(60));
      logger.log(
        `  Report unused disables: ${config.reportUnusedDisableDirectives ? 'yes' : 'no'}`
      );
      logger.newline();
    }
  }

  /**
   * Resolve effective configuration for a specific file
   */
  static resolveConfigForFile(filePath: string, options: ConfigDebugOptions = {}): void {
    const absolutePath = resolve(process.cwd(), filePath);

    if (!existsSync(absolutePath)) {
      logger.error(`Error: File not found: ${absolutePath}`);
      process.exit(1);
    }

    // Find config file starting from file's directory
    const fileDir = dirname(absolutePath);
    const configPath = options.configPath || findConfigFile(fileDir);

    if (!configPath) {
      logger.log(`No configuration file found for: ${filePath}`);
      logger.log('Using default configuration.');
      logger.newline();
      this.printDefaultConfig();
      return;
    }

    const config = loadConfig(configPath);
    const format = options.format || 'json';

    logger.log(`File: ${filePath}`);
    logger.log(`Config: ${configPath}`);
    logger.newline();

    if (format === 'json') {
      logger.log('Effective configuration:');
      logger.log(JSON.stringify(config, null, 2));
    } else if (format === 'table') {
      this.printConfigTable(config, configPath);
    }
  }

  /**
   * Print default configuration
   */
  private static printDefaultConfig(): void {
    const defaultConfig: ClaudeLintConfig = {
      rules: {},
      output: {
        format: 'stylish',
        verbose: false,
      },
    };

    logger.log('Default Configuration:');
    logger.log(JSON.stringify(defaultConfig, null, 2));
  }

  /**
   * Validate configuration and show helpful errors
   */
  static validateConfig(configPath?: string): void {
    const cwd = process.cwd();
    const actualConfigPath = configPath || findConfigFile(cwd);

    if (!actualConfigPath) {
      logger.log('✓ No configuration file found (using defaults)');
      return;
    }

    try {
      const config = loadConfig(actualConfigPath);

      logger.log(`Validating: ${actualConfigPath}`);
      logger.newline();

      let hasErrors = false;

      // Validate rules exist in registry
      if (config.rules) {
        const unknownRules = Object.keys(config.rules).filter(
          (ruleId) => !RuleRegistry.exists(ruleId)
        );

        if (unknownRules.length > 0) {
          hasErrors = true;
          logger.log('✗ Unknown rules found:');
          for (const ruleId of unknownRules) {
            logger.log(`  - ${ruleId}`);
          }
          logger.newline();
          logger.log('Run "claudelint list-rules" to see available rules.');
          logger.newline();
        }
      }

      // Validate rule severities
      if (config.rules) {
        const invalidSeverities = Object.entries(config.rules).filter(([, ruleConfig]) => {
          const severity = typeof ruleConfig === 'string' ? ruleConfig : ruleConfig.severity;
          return !['error', 'warn', 'off'].includes(severity);
        });

        if (invalidSeverities.length > 0) {
          hasErrors = true;
          logger.log('✗ Invalid rule severities:');
          for (const [ruleId, ruleConfig] of invalidSeverities) {
            const severity = typeof ruleConfig === 'string' ? ruleConfig : ruleConfig.severity;
            logger.log(`  - ${ruleId}: "${severity}" (must be "error", "warn", or "off")`);
          }
          logger.newline();
        }
      }

      // Validate output format
      if (config.output?.format && !['stylish', 'compact', 'json'].includes(config.output.format)) {
        hasErrors = true;
        logger.log(`✗ Invalid output format: "${config.output.format}"`);
        logger.log('  Valid formats: stylish, compact, json');
        logger.newline();
      }

      if (!hasErrors) {
        logger.log('✓ Configuration is valid');
        logger.newline();

        // Show summary
        const enabledRules = config.rules
          ? Object.entries(config.rules).filter(([, severity]) => severity !== 'off')
          : [];
        logger.log(`Summary:`);
        logger.log(`  ${enabledRules.length} rules enabled`);
        logger.log(`  Format: ${config.output?.format || 'stylish'}`);
        if (config.maxWarnings !== undefined) {
          logger.log(`  Max warnings: ${config.maxWarnings}`);
        }
      } else {
        process.exit(1);
      }
    } catch (error) {
      logger.error('✗ Failed to load configuration:');
      logger.error(`  ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}
