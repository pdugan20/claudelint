/**
 * check-all command - Run all validators
 *
 * This is the most comprehensive command that runs all enabled validators in parallel
 */

import { Command } from 'commander';
import { ValidatorRegistry } from '../../utils/validator-factory';
import { Reporter } from '../../utils/reporting';
import { findConfigFile, loadConfig, mergeConfig, validateConfig } from '../../utils/config';
import { ConfigError, validateAllRuleOptions } from '../../utils/config-resolver';
import { PluginLoader } from '../../utils/plugin-loader';
import { ValidationCache } from '../../utils/cache';
import { Fixer } from '../../utils/fixer';

/**
 * Register the check-all command
 *
 * @param program - Commander program instance
 */
export function registerCheckAllCommand(program: Command): void {
  program
    .command('check-all')
    .description('Run all validators')
    .option('-v, --verbose', 'Verbose output')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('--strict', 'Exit with error on any issues (errors, warnings, or info)')
    .option('--max-warnings <number>', 'Fail if warning count exceeds limit', parseInt)
    .option('--explain', 'Show detailed explanations and fix suggestions')
    .option('--format <format>', 'Output format: stylish, json, compact (default: stylish)')
    .option('--color', 'Force color output')
    .option('--no-color', 'Disable color output')
    .option('--config <path>', 'Path to config file')
    .option('--fast', 'Fast mode: skip expensive checks')
    .option('--cache', 'Enable caching (default: true)')
    .option('--no-cache', 'Disable caching')
    .option('--cache-location <path>', 'Cache directory', '.claudelint-cache')
    .option('--debug-config', 'Show configuration loading debug information')
    .option('--fix', 'Automatically fix problems')
    .option('--fix-dry-run', 'Preview fixes without applying them')
    .option('--fix-type <type>', 'Fix errors, warnings, or all', 'all')
    .option('--show-docs-url', 'Show documentation URLs for rules')
    .action(
      async (options: {
        verbose?: boolean;
        warningsAsErrors?: boolean;
        strict?: boolean;
        maxWarnings?: number;
        explain?: boolean;
        format?: 'stylish' | 'json' | 'compact';
        color?: boolean;
        config?: string;
        fast?: boolean;
        cache?: boolean;
        cacheLocation?: string;
        debugConfig?: boolean;
        fix?: boolean;
        fixDryRun?: boolean;
        fixType?: 'errors' | 'warnings' | 'all';
        showDocsUrl?: boolean;
      }) => {
        const startTime = Date.now();
        try {
          // Load configuration
          let config = {};
          if (options.config) {
            if (options.debugConfig) {
              console.log(`[Config Debug] Loading config from: ${options.config}`);
            }
            try {
              config = loadConfig(options.config);
              if (options.verbose || options.debugConfig) {
                console.log(`Using config file: ${options.config}`);
              }
              if (options.debugConfig) {
                console.log('[Config Debug] Loaded config:', JSON.stringify(config, null, 2));
              }
            } catch (error: unknown) {
              console.error(`Error loading config file: ${options.config}`);
              console.error(error instanceof Error ? error.message : String(error));
              process.exit(2);
            }
          } else {
            if (options.debugConfig) {
              console.log('[Config Debug] Searching for config file from:', process.cwd());
            }
            const configPath = findConfigFile(process.cwd());
            if (configPath) {
              if (options.debugConfig) {
                console.log(`[Config Debug] Found config file: ${configPath}`);
              }
              try {
                config = loadConfig(configPath);
                if (options.verbose || options.debugConfig) {
                  console.log(`Using config file: ${configPath}`);
                }
                if (options.debugConfig) {
                  console.log('[Config Debug] Loaded config:', JSON.stringify(config, null, 2));
                }
              } catch (error: unknown) {
                console.error(`Error loading config file: ${configPath}`);
                console.error(error instanceof Error ? error.message : String(error));
                process.exit(2);
              }
            } else if (options.debugConfig) {
              console.log('[Config Debug] No config file found, using defaults');
            }
          }

          // Validate config against rule registry (rule IDs exist)
          const configErrors = validateConfig(config);
          if (configErrors.length > 0) {
            console.error('\nConfiguration validation errors:');
            for (const error of configErrors) {
              const prefix = error.severity === 'error' ? '✗ Error:' : '! Warning:';
              console.error(`${prefix} ${error.message}`);
            }
            const hasErrors = configErrors.some((e) => e.severity === 'error');
            if (hasErrors) {
              console.error('\nPlease fix configuration errors before continuing.');
              process.exit(2);
            }
            console.error(''); // Empty line after warnings
          }

          // Validate all rule options early (ESLint pattern: fail fast before running validators)
          try {
            validateAllRuleOptions(config);
          } catch (error) {
            if (error instanceof ConfigError) {
              console.error('\nConfiguration error:');
              console.error(error.message);
              console.error('\nPlease fix your .claudelintrc.json file and try again.');
              process.exit(2);
            }
            throw error; // Re-throw unexpected errors
          }

          // Load plugins
          const pluginLoader = new PluginLoader({
            searchNodeModules: true,
            pluginPrefix: 'claudelint-plugin-',
          });

          const pluginResults = await pluginLoader.loadPlugins(process.cwd());
          const failedPlugins = pluginResults.filter((r) => !r.success);

          if (options.verbose && pluginResults.length > 0) {
            console.log(`Loaded ${pluginResults.filter((r) => r.success).length} plugin(s)`);
            if (failedPlugins.length > 0) {
              console.warn(`Failed to load ${failedPlugins.length} plugin(s):`);
              for (const failure of failedPlugins) {
                console.warn(`  - ${failure.name}: ${failure.error}`);
              }
            }
          }

          // Merge CLI options with config
          const mergedConfig = mergeConfig(config, {
            output: {
              verbose: options.verbose,
              format: options.format,
              color: options.color,
            },
          });

          const reporter = new Reporter({
            verbose: options.verbose || mergedConfig.output?.verbose,
            warningsAsErrors: options.warningsAsErrors,
            explain: options.explain,
            format: options.format || mergedConfig.output?.format,
            color: options.color !== undefined ? options.color : mergedConfig.output?.color,
            showDocsUrl: options.showDocsUrl,
          });

          let totalErrors = 0;
          let totalWarnings = 0;
          const timings: Record<string, number> = {};

          // Initialize cache (disable when using --fix to preserve autoFix functions)
          const cache =
            options.cache !== false && !options.fix && !options.fixDryRun
              ? new ValidationCache({
                  enabled: true,
                  location: options.cacheLocation || '.claudelint-cache',
                  strategy: 'mtime',
                })
              : null;

          // Prepare validator options with config
          const validatorOptions = {
            ...options,
            config: mergedConfig,
          };

          // Get all enabled validator metadata from registry
          const enabledValidators = ValidatorRegistry.getAllMetadata().filter((m) => m.enabled);

          // Run all validators in parallel
          const results = await Promise.all(
            enabledValidators.map((metadata) =>
              reporter.runValidator(
                metadata.name,
                () => ValidatorRegistry.create(metadata.id, validatorOptions).validate(),
                cache,
                mergedConfig
              )
            )
          );

          // Report all results with timing
          reporter.reportParallelResults(results);

          // Aggregate results and timings
          for (const { name, result, duration } of results) {
            timings[name] = duration;
            totalErrors += result.errors.length;
            totalWarnings += result.warnings.length;
          }

          // Apply fixes if requested
          if (options.fix || options.fixDryRun) {
            const fixer = new Fixer({
              dryRun: options.fixDryRun || false,
              fixType: options.fixType || 'all',
            });

            // Collect all fixes from validation results
            for (const { result } of results) {
              // Collect from errors
              for (const error of result.errors) {
                if (error.autoFix && (options.fixType === 'all' || options.fixType === 'errors')) {
                  fixer.registerFix(error.autoFix);
                }
              }
              // Collect from warnings
              for (const warning of result.warnings) {
                if (
                  warning.autoFix &&
                  (options.fixType === 'all' || options.fixType === 'warnings')
                ) {
                  fixer.registerFix(warning.autoFix);
                }
              }
            }

            const fixCount = fixer.getFixCount();
            if (fixCount > 0) {
              console.log(`\n${options.fixDryRun ? '[Preview]' : '[Applying]'} ${fixCount} fixes...`);
              const fixResult = fixer.applyFixes();

              if (options.fixDryRun && fixResult.diff) {
                console.log('\nProposed changes:');
                console.log(fixResult.diff);
              }

              console.log(
                `\n✓ ${fixResult.fixesApplied} fixes ${options.fixDryRun ? 'would be' : ''} applied to ${fixResult.filesFixed} files`
              );

              if (fixResult.failedFixes.length > 0) {
                console.log(`\n✗ ${fixResult.failedFixes.length} fixes failed:`);
                for (const { fix, error } of fixResult.failedFixes) {
                  console.log(`  - ${fix.description}: ${error}`);
                }
              }

              if (!options.fixDryRun && fixResult.filesFixed > 0) {
                console.log('\nTip: Run validation again to check for remaining issues');
              }
            } else {
              console.log('\nInfo: No auto-fixable issues found');
            }
          }

          // Overall summary
          const endTime = Date.now();
          const duration = endTime - startTime;

          if (options.format === 'json') {
            reporter.reportAllJSON();
          } else {
            console.log('\n=== Overall Summary ===');
            console.log(`Total errors: ${totalErrors}`);
            console.log(`Total warnings: ${totalWarnings}`);
            if (options.verbose) {
              console.log(`\nTiming breakdown:`);
              Object.entries(timings).forEach(([name, time]) => {
                console.log(`  ${name}: ${time}ms`);
              });
              console.log(`\nTotal: ${duration}ms`);
            }
          }

          // Check max warnings threshold
          const maxWarnings = options.maxWarnings ?? mergedConfig.maxWarnings ?? -1;
          if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
            console.log(`\nError: Warning limit exceeded: ${totalWarnings} > ${maxWarnings}`);
            process.exit(1);
          }

          // Exit with appropriate code
          if (options.strict && (totalErrors > 0 || totalWarnings > 0)) {
            // Strict mode: fail on any issue
            process.exit(1);
          } else if (totalErrors > 0 || (totalWarnings > 0 && options.warningsAsErrors)) {
            // Errors or warnings-as-errors
            process.exit(1);
          } else {
            // Success (warnings are OK unless --warnings-as-errors or --strict)
            process.exit(0);
          }
        } catch (error: unknown) {
          // Handle configuration errors (invalid rule options)
          if (error instanceof ConfigError) {
            console.error('\nConfiguration error:');
            console.error(error.message);
            console.error('\nPlease fix your .claudelintrc.json file and try again.');
            process.exit(2);
          }

          console.error('\nFatal error during validation:');
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Provide helpful message for common errors
          if (errorMessage.includes('not found') || errorMessage.includes('ENOENT')) {
            console.error(errorMessage);
            console.error(
              '\nThis file is required but does not exist. Please check the file path or create the file.'
            );
          } else {
            console.error(errorMessage);
          }

          if (options.verbose && error instanceof Error && error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack);
          }
          process.exit(2);
        }
      }
    );
}
