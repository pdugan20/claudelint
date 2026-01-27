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
import { loadConfig, findConfigFile, ClaudeLintConfig } from '../utils/config';
import { RuleRegistry } from '../utils/rule-registry';

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
      console.log('No configuration file found.');
      console.log('');
      console.log('Searched locations:');
      console.log('  - .claudelintrc.json');
      console.log('  - .claudelintrc.js');
      console.log('  - package.json (claudelint key)');
      console.log('');
      console.log('Run "claudelint init" to create a configuration file.');
      process.exit(1);
    }

    if (!existsSync(configPath)) {
      console.error(`Error: Config file not found: ${configPath}`);
      process.exit(1);
    }

    const config = loadConfig(configPath);
    const format = options.format || 'json';

    console.log(`Configuration loaded from: ${configPath}`);
    console.log('');

    if (format === 'json') {
      console.log(JSON.stringify(config, null, 2));
    } else if (format === 'table') {
      this.printConfigTable(config, configPath);
    } else {
      console.error(`Unsupported format: ${format}`);
      process.exit(1);
    }
  }

  /**
   * Print config as a table (human-readable)
   */
  private static printConfigTable(config: ClaudeLintConfig, configPath: string): void {
    console.log('Configuration Summary:');
    console.log('='.repeat(60));
    console.log(`Source: ${configPath}`);
    console.log('');

    // Rules section
    if (config.rules && Object.keys(config.rules).length > 0) {
      console.log('Rules:');
      console.log('-'.repeat(60));
      const rules = Object.entries(config.rules).sort(([a], [b]) => a.localeCompare(b));
      for (const [ruleId, ruleConfig] of rules) {
        const rule = RuleRegistry.get(ruleId);
        const severity = typeof ruleConfig === 'string' ? ruleConfig : ruleConfig.severity;
        const status = severity === 'error' ? '✗' : severity === 'warn' ? '!' : '○';
        const category = rule ? `[${rule.category}]` : '';
        console.log(`  ${status} ${ruleId.padEnd(30)} ${String(severity).padEnd(8)} ${category}`);
      }
      console.log('');
    }

    // Output section
    if (config.output) {
      console.log('Output:');
      console.log('-'.repeat(60));
      console.log(`  Format:  ${config.output.format || 'stylish'}`);
      console.log(`  Verbose: ${config.output.verbose ? 'yes' : 'no'}`);
      console.log('');
    }

    // Other options
    if (config.maxWarnings !== undefined) {
      console.log('Limits:');
      console.log('-'.repeat(60));
      console.log(`  Max warnings: ${config.maxWarnings}`);
      console.log('');
    }

    if (config.reportUnusedDisableDirectives !== undefined) {
      console.log('Directives:');
      console.log('-'.repeat(60));
      console.log(
        `  Report unused disables: ${config.reportUnusedDisableDirectives ? 'yes' : 'no'}`
      );
      console.log('');
    }
  }

  /**
   * Resolve effective configuration for a specific file
   */
  static resolveConfigForFile(filePath: string, options: ConfigDebugOptions = {}): void {
    const absolutePath = resolve(process.cwd(), filePath);

    if (!existsSync(absolutePath)) {
      console.error(`Error: File not found: ${absolutePath}`);
      process.exit(1);
    }

    // Find config file starting from file's directory
    const fileDir = dirname(absolutePath);
    const configPath = options.configPath || findConfigFile(fileDir);

    if (!configPath) {
      console.log(`No configuration file found for: ${filePath}`);
      console.log('Using default configuration.');
      console.log('');
      this.printDefaultConfig();
      return;
    }

    const config = loadConfig(configPath);
    const format = options.format || 'json';

    console.log(`File: ${filePath}`);
    console.log(`Config: ${configPath}`);
    console.log('');

    if (format === 'json') {
      console.log('Effective configuration:');
      console.log(JSON.stringify(config, null, 2));
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

    console.log('Default Configuration:');
    console.log(JSON.stringify(defaultConfig, null, 2));
  }

  /**
   * Validate configuration and show helpful errors
   */
  static validateConfig(configPath?: string): void {
    const cwd = process.cwd();
    const actualConfigPath = configPath || findConfigFile(cwd);

    if (!actualConfigPath) {
      console.log('✓ No configuration file found (using defaults)');
      return;
    }

    try {
      const config = loadConfig(actualConfigPath);

      console.log(`Validating: ${actualConfigPath}`);
      console.log('');

      let hasErrors = false;

      // Validate rules exist in registry
      if (config.rules) {
        const unknownRules = Object.keys(config.rules).filter(
          (ruleId) => !RuleRegistry.exists(ruleId)
        );

        if (unknownRules.length > 0) {
          hasErrors = true;
          console.log('✗ Unknown rules found:');
          for (const ruleId of unknownRules) {
            console.log(`  - ${ruleId}`);
          }
          console.log('');
          console.log('Run "claudelint list-rules" to see available rules.');
          console.log('');
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
          console.log('✗ Invalid rule severities:');
          for (const [ruleId, ruleConfig] of invalidSeverities) {
            const severity = typeof ruleConfig === 'string' ? ruleConfig : ruleConfig.severity;
            console.log(`  - ${ruleId}: "${severity}" (must be "error", "warn", or "off")`);
          }
          console.log('');
        }
      }

      // Validate output format
      if (config.output?.format && !['stylish', 'compact', 'json'].includes(config.output.format)) {
        hasErrors = true;
        console.log(`✗ Invalid output format: "${config.output.format}"`);
        console.log('  Valid formats: stylish, compact, json');
        console.log('');
      }

      if (!hasErrors) {
        console.log('✓ Configuration is valid');
        console.log('');

        // Show summary
        const enabledRules = config.rules
          ? Object.entries(config.rules).filter(([, severity]) => severity !== 'off')
          : [];
        console.log(`Summary:`);
        console.log(`  ${enabledRules.length} rules enabled`);
        console.log(`  Format: ${config.output?.format || 'stylish'}`);
        if (config.maxWarnings !== undefined) {
          console.log(`  Max warnings: ${config.maxWarnings}`);
        }
      } else {
        process.exit(1);
      }
    } catch (error) {
      console.error('✗ Failed to load configuration:');
      console.error(`  ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}
