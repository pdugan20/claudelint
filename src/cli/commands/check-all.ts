/**
 * check-all command - Run all validators
 *
 * This is the most comprehensive command that runs all enabled validators in parallel
 */

import { Command } from 'commander';
import { ValidatorRegistry } from '../../utils/validators/factory';
import { Reporter } from '../../utils/reporting/reporting';
import { findConfigFile, loadConfig, mergeConfig, validateConfig } from '../../utils/config/types';
import { ConfigError, validateAllRuleOptions } from '../../utils/config/resolver';
import { CustomRuleLoader } from '../../utils/rules/loader';
import { ValidationCache } from '../../utils/cache';
import { Fixer } from '../../utils/rules/fixer';
import { logger } from '../utils/logger';
import { detectWorkspace } from '../../utils/workspace/detector';
import { basename, relative as pathRelative } from 'path';

/**
 * Register the check-all command
 *
 * @param program - Commander program instance
 */
export function registerCheckAllCommand(program: Command): void {
  program
    .command('check-all')
    .description('Run all validators (supports monorepo workspaces)')
    .option('-v, --verbose', 'Verbose output')
    .option('-q, --quiet', 'Suppress warnings, show only errors')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('--strict', 'Exit with error on any issues (errors, warnings, or info)')
    .option('--max-warnings <number>', 'Fail if warning count exceeds limit', parseInt)
    .option('--explain', 'Show detailed explanations and fix suggestions')
    .option(
      '--format <format>',
      'Output format: stylish, json, compact, sarif, github (default: stylish)'
    )
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
    .option('--timing', 'Show per-validator timing breakdown')
    .option('--show-docs-url', 'Show documentation URLs for rules')
    .option('--no-deprecated-warnings', 'Suppress warnings about deprecated rules')
    .option('--error-on-deprecated', 'Treat usage of deprecated rules as errors')
    .option('--allow-empty-input', 'Exit 0 when no files to check (useful with lint-staged)')
    .option(
      '--workspace <name>',
      'Validate specific workspace package by name (works from any directory)'
    )
    .option('--workspaces', 'Validate all workspace packages (works from any directory)')
    .action(
      async (options: {
        verbose?: boolean;
        quiet?: boolean;
        warningsAsErrors?: boolean;
        strict?: boolean;
        maxWarnings?: number;
        explain?: boolean;
        format?: 'stylish' | 'json' | 'compact' | 'sarif' | 'github';
        color?: boolean;
        config?: string;
        fast?: boolean;
        cache?: boolean;
        cacheLocation?: string;
        debugConfig?: boolean;
        fix?: boolean;
        fixDryRun?: boolean;
        fixType?: 'errors' | 'warnings' | 'all';
        timing?: boolean;
        showDocsUrl?: boolean;
        deprecatedWarnings?: boolean;
        errorOnDeprecated?: boolean;
        allowEmptyInput?: boolean;
        workspace?: string;
        workspaces?: boolean;
      }) => {
        const startTime = Date.now();
        try {
          // Load configuration
          let config = {};
          if (options.config) {
            if (options.debugConfig) {
              logger.info(`[Config Debug] Loading config from: ${options.config}`);
            }
            try {
              config = loadConfig(options.config);
              if (options.verbose || options.debugConfig) {
                logger.info(`Using config file: ${options.config}`);
              }
              if (options.debugConfig) {
                logger.log('[Config Debug] Loaded config:');
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
                config = loadConfig(configPath);
                if (options.verbose || options.debugConfig) {
                  logger.info(`Using config file: ${configPath}`);
                }
                if (options.debugConfig) {
                  logger.log('[Config Debug] Loaded config:');
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
              if (error.severity === 'error') {
                logger.error(error.message);
              } else {
                logger.warn(error.message);
              }
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

          // Load custom rules
          const customRuleLoader = new CustomRuleLoader({
            customRulesPath: '.claudelint/rules',
            enableCustomRules: true,
          });

          const customRuleResults = await customRuleLoader.loadCustomRules(process.cwd());
          const failedCustomRules = customRuleResults.filter((r) => !r.success);

          if (options.verbose && customRuleResults.length > 0) {
            const successful = customRuleResults.filter((r) => r.success);
            logger.success(`Loaded ${successful.length} custom rule(s)`);

            if (failedCustomRules.length > 0) {
              logger.warn(`Failed to load ${failedCustomRules.length} custom rule(s):`);
              for (const failure of failedCustomRules) {
                logger.detail(`- ${failure.filePath}: ${failure.error}`);
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
            quiet: options.quiet,
            warningsAsErrors: options.warningsAsErrors,
            explain: options.explain,
            format: options.format || mergedConfig.output?.format,
            color: options.color !== undefined ? options.color : mergedConfig.output?.color,
            showDocsUrl: options.showDocsUrl,
            deprecatedWarnings: options.deprecatedWarnings !== false,
            errorOnDeprecated: options.errorOnDeprecated,
          });

          // Handle workspace-scoped validation
          if (options.workspace || options.workspaces) {
            // Auto-detect workspace root from current directory
            const workspace = await detectWorkspace(process.cwd(), true);

            if (!workspace) {
              logger.newline();
              logger.error('No workspace detected in current directory or parent directories.');
              logger.error(
                'Workspace detection supports pnpm-workspace.yaml and package.json workspaces.'
              );
              logger.newline();
              logger.error('Please run this command from a monorepo root directory.');
              process.exit(2);
            }

            if (options.workspace) {
              // Validate specific package
              const packagePath = workspace.packages.find(
                (pkg) => basename(pkg) === options.workspace
              );

              if (!packagePath) {
                logger.newline();
                logger.error(`Workspace package not found: ${options.workspace}`);
                logger.newline();
                logger.log('Available packages:');
                workspace.packages.forEach((pkg) => {
                  logger.detail(`- ${basename(pkg)}`);
                });
                process.exit(2);
              }

              logger.info(`Validating workspace package: ${options.workspace}`);
              logger.newline();

              // Change to package directory for validation
              process.chdir(packagePath);
            } else if (options.workspaces) {
              // Validate all packages
              logger.info(`Validating ${workspace.packages.length} workspace packages`);
              logger.newline();

              // Prepare validator options with config
              const validatorOptions = {
                ...options,
                config: mergedConfig,
              };

              // Save original cwd before parallel validation
              const originalCwd = process.cwd();

              // Validate all packages in parallel
              const packageResults = await Promise.all(
                workspace.packages.map(async (packagePath) => {
                  const packageName = basename(packagePath);

                  try {
                    // Change to package directory (each async task gets its own context)
                    process.chdir(packagePath);

                    // Run validators for this package
                    const enabledValidators = ValidatorRegistry.getAllMetadata().filter(
                      (m) => m.enabled
                    );

                    const results = await Promise.all(
                      enabledValidators.map((metadata) =>
                        reporter.runValidator(
                          metadata.name,
                          () => ValidatorRegistry.create(metadata.id, validatorOptions).validate(),
                          null, // No cache for workspace validation
                          mergedConfig
                        )
                      )
                    );

                    // Aggregate results for this package
                    let packageErrors = 0;
                    let packageWarnings = 0;
                    for (const { result } of results) {
                      packageErrors += result.errors.length;
                      packageWarnings += result.warnings.length;
                    }

                    return {
                      packageName,
                      packagePath,
                      results,
                      errors: packageErrors,
                      warnings: packageWarnings,
                      success: true,
                    };
                  } catch (error) {
                    return {
                      packageName,
                      packagePath,
                      results: [],
                      errors: 0,
                      warnings: 0,
                      success: false,
                      error: error instanceof Error ? error.message : String(error),
                    };
                  } finally {
                    // Restore cwd after validation
                    process.chdir(originalCwd);
                  }
                })
              );

              // Display results for each package in original order
              let totalWorkspaceErrors = 0;
              let totalWorkspaceWarnings = 0;
              const failedPackages: string[] = [];

              for (const pkgResult of packageResults) {
                logger.section(`Package: ${pkgResult.packageName}`);

                if (!pkgResult.success) {
                  logger.error(`Failed to validate package: ${pkgResult.error}`);
                  failedPackages.push(pkgResult.packageName);
                } else {
                  // Display validator results
                  reporter.reportParallelResults(pkgResult.results);

                  totalWorkspaceErrors += pkgResult.errors;
                  totalWorkspaceWarnings += pkgResult.warnings;

                  if (
                    pkgResult.errors > 0 ||
                    (pkgResult.warnings > 0 && options.warningsAsErrors)
                  ) {
                    failedPackages.push(pkgResult.packageName);
                  }
                }

                logger.newline();
              }

              // Overall workspace summary
              logger.section('Workspace Summary');
              logger.log(`Total packages: ${workspace.packages.length}`);
              logger.log(`Failed packages: ${failedPackages.length}`);
              logger.log(`Total errors: ${totalWorkspaceErrors}`);
              logger.log(`Total warnings: ${totalWorkspaceWarnings}`);

              if (failedPackages.length > 0) {
                logger.newline();
                logger.error('Failed packages:');
                failedPackages.forEach((pkg) => {
                  logger.detail(`- ${pkg}`);
                });
                process.exitCode = 1;
                return;
              } else {
                process.exitCode = 0;
                return;
              }
            }
          }

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

          // Aggregate results, timings, and scanMetadata
          let totalFilesScanned = 0;
          const activeComponents: string[] = [];
          const activeTimings: Record<string, number> = {};
          let fixableCount = 0;

          for (let i = 0; i < results.length; i++) {
            const { name, result, duration } = results[i];
            const validatorId = enabledValidators[i].id;

            timings[name] = duration;
            totalErrors += result.errors.length;
            totalWarnings += result.warnings.length;

            // Track scan metadata for summary line
            if (result.scanMetadata && !result.scanMetadata.skipped) {
              totalFilesScanned += result.scanMetadata.filesScanned;
              activeComponents.push(validatorId);
              activeTimings[validatorId] = duration;
            }

            // Count fixable issues
            fixableCount += result.errors.filter((e) => e.autoFix).length;
            fixableCount += result.warnings.filter((w) => w.autoFix).length;
          }

          // Verbose mode: show component status (active with files, skipped with reasons)
          const isMachine =
            options.format === 'json' || options.format === 'sarif' || options.format === 'github';
          if (options.verbose && !isMachine) {
            const cwd = process.cwd();
            logger.newline();

            // Active validators with file listings
            for (let i = 0; i < results.length; i++) {
              const { result } = results[i];
              const validatorId = enabledValidators[i].id;
              const meta = result.scanMetadata;

              if (meta && !meta.skipped) {
                logger.log(
                  `${validatorId} (${meta.filesScanned} file${meta.filesScanned === 1 ? '' : 's'})`
                );
                for (const file of meta.filesFound) {
                  // Show relative path from project root
                  const rel = pathRelative(cwd, file) || file;
                  logger.detail(rel);
                }
                logger.newline();
              }
            }

            // Skipped validators with aligned columns
            const skipped: Array<{ id: string; reason: string }> = [];
            for (let i = 0; i < results.length; i++) {
              const { result } = results[i];
              const validatorId = enabledValidators[i].id;
              const meta = result.scanMetadata;
              if (meta && meta.skipped) {
                skipped.push({ id: validatorId, reason: meta.skipReason || 'no files' });
              }
            }

            if (skipped.length > 0) {
              logger.log(`Skipped (${skipped.length}):`);
              const maxIdLen = Math.max(...skipped.map((s) => s.id.length));
              for (const { id, reason } of skipped) {
                logger.detail(`${id.padEnd(maxIdLen + 2)}${reason}`);
              }
              logger.newline();
            }
          }

          // Visual separator between discovery section and issues
          if (options.verbose && !isMachine && (totalErrors > 0 || totalWarnings > 0)) {
            logger.log('Problems:');
          }

          // Report all results with timing — enrich with validator IDs
          const enrichedResults = results.map((r, i) => ({
            ...r,
            id: enabledValidators[i].id,
          }));
          reporter.reportParallelResults(enrichedResults);

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
              logger.newline();
              logger.info(`${options.fixDryRun ? '[Preview]' : '[Applying]'} ${fixCount} fixes...`);
              const fixResult = fixer.applyFixes();

              if (options.fixDryRun && fixResult.diff) {
                logger.newline();
                logger.log('Proposed changes:');
                logger.log(fixResult.diff);
              }

              logger.newline();
              logger.success(
                `${fixResult.fixesApplied} fixes ${options.fixDryRun ? 'would be' : ''} applied to ${fixResult.filesFixed} files`
              );

              if (fixResult.failedFixes.length > 0) {
                logger.newline();
                logger.error(`${fixResult.failedFixes.length} fixes failed:`);
                for (const { fix, error } of fixResult.failedFixes) {
                  logger.detail(`- ${fix.description}: ${error}`);
                }
              }

              if (!options.fixDryRun && fixResult.filesFixed > 0) {
                logger.newline();
                logger.info('Tip: Run validation again to check for remaining issues');
              }
            } else {
              logger.newline();
              logger.info('No auto-fixable issues found');
            }
          }

          // Overall summary
          const endTime = Date.now();
          const duration = endTime - startTime;

          if (options.format === 'json') {
            reporter.reportAllJSON();
          } else if (options.format === 'sarif') {
            reporter.reportAllSARIF();
          } else if (options.format === 'github') {
            reporter.reportAllGitHub();
          } else {
            // Summary line
            const componentStr =
              activeComponents.length > 0
                ? ` across ${activeComponents.length} component${activeComponents.length === 1 ? '' : 's'} (${activeComponents.join(', ')})`
                : '';
            const totalProblems = totalErrors + totalWarnings;

            logger.newline();
            if (totalProblems === 0) {
              logger.success(
                `Checked ${totalFilesScanned} file${totalFilesScanned === 1 ? '' : 's'}${componentStr} in ${duration}ms. No problems found.`
              );
            } else {
              logger.log(
                `Checked ${totalFilesScanned} file${totalFilesScanned === 1 ? '' : 's'}${componentStr} in ${duration}ms.`
              );
              logger.error(
                `${totalProblems} problem${totalProblems === 1 ? '' : 's'} (${totalErrors} error${totalErrors === 1 ? '' : 's'}, ${totalWarnings} warning${totalWarnings === 1 ? '' : 's'})`
              );
              if (fixableCount > 0) {
                logger.info(`${fixableCount} potentially fixable with --fix`);
              }
            }

            // Timing breakdown (shown with --verbose or --timing)
            if (options.verbose || options.timing) {
              const timingEntries = Object.entries(activeTimings);
              if (timingEntries.length > 0) {
                const maxIdLen = Math.max(...timingEntries.map(([id]) => id.length));
                logger.newline();
                logger.log('Timing:');
                for (const [id, time] of timingEntries) {
                  logger.detail(`${id.padEnd(maxIdLen + 2)}${time}ms`);
                }
              }
            }
          }

          // Check for deprecated rules (if errorOnDeprecated is enabled)
          let hasDeprecatedRules = false;
          if (options.errorOnDeprecated) {
            for (const { result } of results) {
              if (result.deprecatedRulesUsed && result.deprecatedRulesUsed.length > 0) {
                hasDeprecatedRules = true;
                break;
              }
            }
          }

          // Check max warnings threshold
          const maxWarnings = options.maxWarnings ?? mergedConfig.maxWarnings ?? -1;
          if (maxWarnings >= 0 && totalWarnings > maxWarnings) {
            logger.newline();
            logger.error(`Warning limit exceeded: ${totalWarnings} > ${maxWarnings}`);
            process.exitCode = 1;
            return;
          }

          // Handle empty input: when no files were found to check
          if (totalFilesScanned === 0 && totalErrors === 0 && totalWarnings === 0) {
            if (options.allowEmptyInput) {
              process.exitCode = 0;
              return;
            }
            // Without --allow-empty-input, warn the user (but still exit 0)
            if (
              options.format !== 'json' &&
              options.format !== 'sarif' &&
              options.format !== 'github'
            ) {
              logger.info(
                'No files found to check. Use --allow-empty-input to suppress this message.'
              );
            }
          }

          // Set exit code (use process.exitCode instead of process.exit to allow stdout to drain)
          if (hasDeprecatedRules) {
            // Deprecated rules treated as errors
            logger.newline();
            logger.error('Deprecated rules detected (--error-on-deprecated)');
            process.exitCode = 1;
          } else if (options.strict && (totalErrors > 0 || totalWarnings > 0)) {
            // Strict mode: fail on any issue
            process.exitCode = 1;
          } else if (totalErrors > 0 || (totalWarnings > 0 && options.warningsAsErrors)) {
            // Errors or warnings-as-errors
            process.exitCode = 1;
          } else {
            // Success (warnings are OK unless --warnings-as-errors or --strict)
            process.exitCode = 0;
          }
        } catch (error: unknown) {
          // Handle configuration errors (invalid rule options)
          if (error instanceof ConfigError) {
            logger.newline();
            logger.error('Configuration error:');
            logger.error(error.message);
            logger.newline();
            logger.error('Please fix your .claudelintrc.json file and try again.');
            process.exit(2);
          }

          logger.newline();
          logger.error('Fatal error during validation:');
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Provide helpful message for common errors
          if (errorMessage.includes('not found') || errorMessage.includes('ENOENT')) {
            logger.error(errorMessage);
            logger.newline();
            logger.error(
              'This file is required but does not exist. Please check the file path or create the file.'
            );
          } else {
            logger.error(errorMessage);
          }

          if (options.verbose && error instanceof Error && error.stack) {
            logger.newline();
            logger.log('Stack trace:');
            logger.log(error.stack);
          }
          process.exit(2);
        }
      }
    );
}
