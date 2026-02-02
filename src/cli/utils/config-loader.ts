/**
 * Configuration loading utilities for CLI commands
 *
 * Follows ESLint pattern: all commands load config by default, --no-config to opt-out
 */

import { findConfigFile, validateConfig } from '../../utils/config/types';
import { loadConfigWithExtends } from '../../utils/config/extends';
import { ConfigError, validateAllRuleOptions } from '../../utils/config/resolver';
import { ClaudeLintConfig } from '../../utils/config/types';
import { logger } from './logger';

/**
 * Load and validate configuration for commands
 * Follows ESLint pattern: all commands load config by default, --no-config to opt-out
 *
 * @param options - Command options (config, verbose, debugConfig)
 * @returns Loaded and validated config object (empty if --no-config)
 */
export function loadAndValidateConfig(options: {
  config?: string | false; // Commander sets config to false when --no-config is used
  verbose?: boolean;
  debugConfig?: boolean;
}): ClaudeLintConfig {
  // Skip config loading if --no-config flag is set (Commander sets config to false)
  if (options.config === false) {
    if (options.verbose || options.debugConfig) {
      logger.info('Skipping config file (--no-config)');
    }
    return {};
  }

  let config: ClaudeLintConfig = {};

  // Load from explicit path or auto-discover
  if (options.config) {
    if (options.debugConfig) {
      logger.info(`[Config Debug] Loading config from: ${options.config}`);
    }
    try {
      config = loadConfigWithExtends(options.config);
      if (options.verbose || options.debugConfig) {
        logger.info(`Using config file: ${options.config}`);
      }
      if (options.debugConfig) {
        logger.info('[Config Debug] Loaded config (with extends resolved):');
        logger.log(JSON.stringify(config, null, 2));
      }
    } catch (error: unknown) {
      logger.error(`Error loading config file: ${options.config}`);
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(2);
    }
  } else {
    if (options.debugConfig) {
      logger.info(`[Config Debug] Searching for config file from: ${process.cwd()}`);
    }
    const configPath = findConfigFile(process.cwd());
    if (configPath) {
      if (options.debugConfig) {
        logger.info(`[Config Debug] Found config file: ${configPath}`);
      }
      try {
        config = loadConfigWithExtends(configPath);
        if (options.verbose || options.debugConfig) {
          logger.info(`Using config file: ${configPath}`);
        }
        if (options.debugConfig) {
          logger.info('[Config Debug] Loaded config (with extends resolved):');
          logger.log(JSON.stringify(config, null, 2));
        }
      } catch (error: unknown) {
        logger.error(`Error loading config file: ${configPath}`);
        logger.error(error instanceof Error ? error.message : String(error));
        process.exit(2);
      }
    } else if (options.debugConfig) {
      logger.info('[Config Debug] No config file found, using defaults');
    }
  }

  // Validate config against rule registry (rule IDs exist)
  const configErrors = validateConfig(config);
  if (configErrors.length > 0) {
    logger.newline();
    logger.error('Configuration validation errors:');
    for (const error of configErrors) {
      const prefix = error.severity === 'error' ? '✗ Error:' : '! Warning:';
      logger.error(`${prefix} ${error.message}`);
    }
    const hasErrors = configErrors.some((e) => e.severity === 'error');
    if (hasErrors) {
      logger.newline();
      logger.error('Please fix configuration errors before continuing.');
      process.exit(2);
    }
    logger.newline();
  }

  // Validate all rule options early (ESLint pattern: fail fast before running validators)
  try {
    validateAllRuleOptions(config);
  } catch (error) {
    if (error instanceof ConfigError) {
      logger.newline();
      logger.error('Configuration error:');
      logger.error(error.message);
      logger.newline();
      logger.error('Please fix your .claudelintrc.json file and try again.');
      process.exit(2);
    }
    throw error; // Re-throw unexpected errors
  }

  return config;
}
