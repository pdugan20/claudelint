/**
 * check-all command - Run all validators
 *
 * This is the most comprehensive command that runs all enabled validators in parallel
 */

import { Command } from 'commander';
import { ValidatorRegistry } from '../../utils/validators/factory';
import { Reporter } from '../../utils/reporting/reporting';
import { ConfigError } from '../../utils/config/resolver';
import { loadConfig, validateLoadedConfig } from '../utils/config-loader';
import { buildReporterOptions } from '../utils/reporter-options';
import { CustomRuleLoader } from '../../utils/rules/loader';
import { ValidationCache } from '../../utils/cache';
import { Fixer } from '../../utils/rules/fixer';
import { logger } from '../utils/logger';
import { detectWorkspace } from '../../utils/workspace/detector';
import { basename, relative as pathRelative } from 'path';
import { CheckAllOptions } from '../types';
import {
  addCommonOptions,
  addOutputOptions,
  addEnforcementOptions,
  addCacheOptions,
  addFixOptions,
  addFileSelectionOptions,
  addWorkspaceOptions,
} from '../utils/option-builders';

/**
 * Register the check-all command
 *
 * @param program - Commander program instance
 */
export function registerCheckAllCommand(program: Command): void {
  const cmd = program
    .command('check-all', { isDefault: true })
    .description('Run all validators (supports monorepo workspaces)');

  // Register option groups (order determines --help display order)
  addCommonOptions(cmd);
  addOutputOptions(cmd);
  addEnforcementOptions(cmd);
  addCacheOptions(cmd);
  addFixOptions(cmd);
  addFileSelectionOptions(cmd);
  addWorkspaceOptions(cmd);
  cmd.option('--fast', 'Fast mode: skip expensive checks');

  cmd.action(async (options: CheckAllOptions) => {
    const startTime = Date.now();

    // Register signal handlers for clean exit
    const handleSignal = (signal: string) => {
      logger.newline();
      logger.info(`Received ${signal}, stopping...`);
      process.exit(130);
    };
    process.on('SIGINT', () => handleSignal('SIGINT'));
    process.on('SIGTERM', () => handleSignal('SIGTERM'));

    try {
      // Load configuration (without validation — custom rules must register first)
      const config = loadConfig(options);

      // Load custom rules before config validation so their IDs are in the registry
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

      // Now validate config (custom rule IDs are registered)
      validateLoadedConfig(config);

      // Apply --rule CLI overrides (highest precedence)
      if (options.rule && options.rule.length > 0) {
        if (!config.rules) config.rules = {};
        for (const ruleOverride of options.rule) {
          const colonIdx = ruleOverride.lastIndexOf(':');
          if (colonIdx === -1) {
            logger.error(`Invalid --rule format: "${ruleOverride}". Expected "rule-id:severity"`);
            process.exit(2);
          }
          const ruleId = ruleOverride.slice(0, colonIdx);
          const severity = ruleOverride.slice(colonIdx + 1);
          if (!['off', 'warn', 'error'].includes(severity)) {
            logger.error(
              `Invalid severity "${severity}" in --rule "${ruleOverride}". Use off, warn, or error.`
            );
            process.exit(2);
          }
          config.rules[ruleId] = severity as 'off' | 'warn' | 'error';
          if (options.verbose) {
            logger.info(`Rule override: ${ruleId} -> ${severity}`);
          }
        }
      }

      // Resolve VCS-aware file selection (--changed, --since)
      let changedFiles: string[] | undefined;
      if (options.changed || options.since) {
        const { getChangedFiles, getFilesSince } = await import('../utils/git-diff');
        const files = options.since ? getFilesSince(options.since) : getChangedFiles();

        if (files === null) {
          logger.error('Not in a git repository. --changed and --since require git.');
          process.exit(2);
        }

        changedFiles = files;
        if (options.verbose) {
          logger.info(`VCS filter: ${changedFiles.length} changed file(s)`);
        }

        if (changedFiles.length === 0) {
          logger.success('No changed files to check.');
          process.exitCode = 0;
          return;
        }
      }

      // Handle stdin mode (--stdin)
      if (options.stdin) {
        const stdinFilename = options.stdinFilename || 'stdin';
        const { readStdin } = await import('../utils/stdin-reader');
        const stdinContent = await readStdin();

        // Find matching validator(s) based on filename
        const { minimatch } = await import('minimatch');
        const allValidators = ValidatorRegistry.getAllMetadata().filter((m) => m.enabled);
        const matchingValidators = allValidators.filter((meta) =>
          meta.filePatterns.some((pattern) => minimatch(stdinFilename, pattern))
        );

        if (matchingValidators.length === 0) {
          logger.error(
            `No validator matches filename "${stdinFilename}". ` +
              'Use --stdin-filename to specify the file type (e.g., CLAUDE.md, .claude/settings.json).'
          );
          process.exit(2);
        }

        const reporter = new Reporter(buildReporterOptions(options, config));
        const validatorOptions = {
          ...options,
          config: config,
          stdinContent,
          stdinFilename,
        };

        const results = await Promise.all(
          matchingValidators.map((metadata) =>
            reporter.runValidator(
              metadata.name,
              () => ValidatorRegistry.create(metadata.id, validatorOptions).validate(),
              null,
              config
            )
          )
        );

        let totalErrors = 0;
        let totalWarnings = 0;
        for (const { result } of results) {
          totalErrors += result.errors.length;
          totalWarnings += result.warnings.length;
        }

        reporter.reportParallelResults(results);

        if (options.format === 'json') {
          reporter.reportAllJSON();
        } else if (options.format === 'sarif') {
          reporter.reportAllSARIF();
        } else if (options.format === 'github') {
          reporter.reportAllGitHub();
        } else {
          logger.newline();
          if (totalErrors === 0 && totalWarnings === 0) {
            logger.success(`stdin (${stdinFilename}): No problems found.`);
          } else {
            const totalProblems = totalErrors + totalWarnings;
            logger.error(
              `${totalProblems} problem${totalProblems === 1 ? '' : 's'} (${totalErrors} error${totalErrors === 1 ? '' : 's'}, ${totalWarnings} warning${totalWarnings === 1 ? '' : 's'})`
            );
          }
        }

        process.exitCode =
          totalErrors > 0 || (totalWarnings > 0 && options.warningsAsErrors) ? 1 : 0;
        return;
      }

      // Build reporter with CLI options taking precedence over config
      const reporter = new Reporter(buildReporterOptions(options, config));

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
          const packagePath = workspace.packages.find((pkg) => basename(pkg) === options.workspace);

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
            config: config,
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
                      config
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

              if (pkgResult.errors > 0 || (pkgResult.warnings > 0 && options.warningsAsErrors)) {
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
              strategy: options.cacheStrategy === 'content' ? 'content' : 'mtime',
            })
          : null;

      // Prepare validator options with config
      const validatorOptions = {
        ...options,
        config: config,
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
            config
          )
        )
      );

      // Aggregate results, timings, and scanMetadata
      let totalFilesScanned = 0;
      const activeCategories: string[] = [];
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
          activeCategories.push(validatorId);
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
            const isTestFile = (rel: string) =>
              rel.startsWith('tests/') || rel.includes('__temp__/') || rel.includes('fixtures/');

            const projectFiles: string[] = [];
            const testFiles: string[] = [];
            for (const file of meta.filesFound) {
              const rel = pathRelative(cwd, file) || file;
              if (isTestFile(rel)) {
                testFiles.push(rel);
              } else {
                projectFiles.push(rel);
              }
            }
            for (const rel of projectFiles) {
              logger.detail(rel);
            }
            if (testFiles.length > 0) {
              logger.detail(`... and ${testFiles.length} more in tests/`);
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
            if (warning.autoFix && (options.fixType === 'all' || options.fixType === 'warnings')) {
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
        const categoryStr =
          activeCategories.length > 0
            ? ` across ${activeCategories.length} ${activeCategories.length === 1 ? 'category' : 'categories'} (${activeCategories.join(', ')})`
            : '';
        const totalProblems = totalErrors + totalWarnings;

        logger.newline();
        if (totalProblems === 0) {
          logger.success(
            `Checked ${totalFilesScanned} file${totalFilesScanned === 1 ? '' : 's'}${categoryStr} in ${duration}ms. No problems found.`
          );
        } else {
          logger.log(
            `Checked ${totalFilesScanned} file${totalFilesScanned === 1 ? '' : 's'}${categoryStr} in ${duration}ms.`
          );
          logger.error(
            `${totalProblems} problem${totalProblems === 1 ? '' : 's'} (${totalErrors} error${totalErrors === 1 ? '' : 's'}, ${totalWarnings} warning${totalWarnings === 1 ? '' : 's'})`
          );
          if (fixableCount > 0) {
            logger.info(`${fixableCount} potentially fixable with --fix`);
          }

          // Explain mode footer: point to Tier 3 explain subcommand
          const explainFooter = reporter.getExplainFooter();
          if (explainFooter) {
            logger.log(explainFooter);
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
      const maxWarnings = options.maxWarnings ?? config.maxWarnings ?? -1;
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
          logger.info('No files found to check. Use --allow-empty-input to suppress this message.');
        }
      }

      // Write output to file if --output-file is specified
      if (options.outputFile) {
        const outputStr = reporter.getFormattedOutputString();
        if (outputStr !== null) {
          const { writeFileSync } = await import('fs');
          writeFileSync(options.outputFile, outputStr + '\n', 'utf-8');
          if (options.verbose) {
            logger.info(`Results written to ${options.outputFile}`);
          }
        } else if (options.verbose) {
          logger.warn(`--output-file is most useful with --format json, sarif, or github`);
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
  });
}
