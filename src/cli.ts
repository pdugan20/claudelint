#!/usr/bin/env node

import { Command } from 'commander';
// Import validators to ensure self-registration
import './validators';
import { ValidatorRegistry } from './utils/validator-factory';
import { Reporter } from './utils/reporting';
import { execSync } from 'child_process';
import { findConfigFile, loadConfig, mergeConfig, validateConfig } from './utils/config';
import { ConfigError, validateAllRuleOptions } from './utils/config-resolver';
import { InitWizard } from './cli/init-wizard';
import { ConfigDebugger } from './cli/config-debug';
import { Fixer } from './utils/fixer';
import { ValidationCache } from './utils/cache';
import { RuleRegistry, RuleMetadata } from './utils/rule-registry';
import { PluginLoader } from './utils/plugin-loader';

const program = new Command();

program
  .name('claudelint')
  .description('A comprehensive linter for Claude Code projects')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize claudelint configuration')
  .option('-y, --yes', 'Use default configuration without prompts')
  .action(async (options: { yes?: boolean }) => {
    const wizard = new InitWizard();
    await wizard.run(options);
  });

program
  .command('print-config')
  .description('Print resolved configuration')
  .option('--format <format>', 'Output format: json, table (default: json)', 'json')
  .option('--config <path>', 'Path to config file')
  .action((options: { format?: 'json' | 'table'; config?: string }) => {
    ConfigDebugger.printConfig({ format: options.format, configPath: options.config });
  });

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

program
  .command('validate-config')
  .description('Validate configuration file')
  .option('--config <path>', 'Path to config file')
  .action((options: { config?: string }) => {
    ConfigDebugger.validateConfig(options.config);
  });

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

program
  .command('check-claude-md')
  .description('Validate CLAUDE.md files')
  .option('--path <path>', 'Custom path to CLAUDE.md')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .option('--explain', 'Show detailed explanations and fix suggestions')
  .action(
    async (options: {
      path?: string;
      verbose?: boolean;
      warningsAsErrors?: boolean;
      explain?: boolean;
    }) => {
      try {
        const validator = ValidatorRegistry.create('claude-md', options);
        const reporter = new Reporter({
          verbose: options.verbose,
          warningsAsErrors: options.warningsAsErrors,
          explain: options.explain,
        });

        reporter.section('Validating CLAUDE.md files...');

        const result = await validator.validate();

        reporter.report(result, 'CLAUDE.md');

        process.exit(reporter.getExitCode(result));
      } catch (error) {
        console.error('\nValidation failed:');
        console.error(error instanceof Error ? error.message : String(error));
        if (options.verbose && error instanceof Error && error.stack) {
          console.error('\nStack trace:');
          console.error(error.stack);
        }
        process.exit(2);
      }
    }
  );

program
  .command('validate-skills')
  .description('Validate Claude skills')
  .option('--path <path>', 'Custom path to skills directory')
  .option('--skill <name>', 'Validate specific skill')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(
    async (options: {
      path?: string;
      skill?: string;
      verbose?: boolean;
      warningsAsErrors?: boolean;
    }) => {
      try {
        const validator = ValidatorRegistry.create('skills', options);
        const reporter = new Reporter({
          verbose: options.verbose,
          warningsAsErrors: options.warningsAsErrors,
        });

        reporter.section('Validating Claude skills...');

        const result = await validator.validate();

        reporter.report(result, 'Skills');

        process.exit(reporter.getExitCode(result));
      } catch (error) {
        console.error('\nValidation failed:');
        console.error(error instanceof Error ? error.message : String(error));
        if (options.verbose && error instanceof Error && error.stack) {
          console.error('\nStack trace:');
          console.error(error.stack);
        }
        process.exit(2);
      }
    }
  );

program
  .command('validate-settings')
  .description('Validate settings.json files')
  .option('--path <path>', 'Custom path to settings.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    try {
      const validator = ValidatorRegistry.create('settings', options);
      const reporter = new Reporter({
        verbose: options.verbose,
        warningsAsErrors: options.warningsAsErrors,
      });

      reporter.section('Validating settings.json files...');

      const result = await validator.validate();

      reporter.report(result, 'Settings');

      process.exit(reporter.getExitCode(result));
    } catch (error) {
      console.error('\nValidation failed:');
      console.error(error instanceof Error ? error.message : String(error));
      if (options.verbose && error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(2);
    }
  });

program
  .command('validate-hooks')
  .description('Validate hooks.json files')
  .option('--path <path>', 'Custom path to hooks.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    try {
      const validator = ValidatorRegistry.create('hooks', options);
      const reporter = new Reporter({
        verbose: options.verbose,
        warningsAsErrors: options.warningsAsErrors,
      });

      reporter.section('Validating hooks.json files...');

      const result = await validator.validate();

      reporter.report(result, 'Hooks');

      process.exit(reporter.getExitCode(result));
    } catch (error) {
      console.error('\nValidation failed:');
      console.error(error instanceof Error ? error.message : String(error));
      if (options.verbose && error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(2);
    }
  });

program
  .command('validate-mcp')
  .description('Validate MCP server configuration files')
  .option('--path <path>', 'Custom path to .mcp.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    try {
      const validator = ValidatorRegistry.create('mcp', options);
      const reporter = new Reporter({
        verbose: options.verbose,
        warningsAsErrors: options.warningsAsErrors,
      });

      reporter.section('Validating MCP server configuration files...');

      const result = await validator.validate();

      reporter.report(result, 'MCP');

      process.exit(reporter.getExitCode(result));
    } catch (error) {
      console.error('\nValidation failed:');
      console.error(error instanceof Error ? error.message : String(error));
      if (options.verbose && error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(2);
    }
  });

program
  .command('validate-plugin')
  .description('Validate plugin manifest files')
  .option('--path <path>', 'Custom path to plugin.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    try {
      const validator = ValidatorRegistry.create('plugin', options);
      const reporter = new Reporter({
        verbose: options.verbose,
        warningsAsErrors: options.warningsAsErrors,
      });

      reporter.section('Validating plugin manifest files...');

      const result = await validator.validate();

      reporter.report(result, 'Plugin');

      process.exit(reporter.getExitCode(result));
    } catch (error) {
      console.error('\nValidation failed:');
      console.error(error instanceof Error ? error.message : String(error));
      if (options.verbose && error instanceof Error && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
      process.exit(2);
    }
  });

program
  .command('format')
  .description('Format Claude files with markdownlint, prettier, and shellcheck')
  .option('--check', 'Check formatting without making changes')
  .option('--fix', 'Fix formatting issues (default)')
  .option('-v, --verbose', 'Verbose output')
  .action((options: { check?: boolean; fix?: boolean; verbose?: boolean }) => {
    const mode = options.check ? 'check' : 'fix';
    const verbose = options.verbose || false;

    console.log(`\nFormatting Claude files (${mode} mode)...\n`);

    // Define Claude-specific file patterns
    const claudeFiles = {
      markdown: ['CLAUDE.md', '.claude/**/*.md'],
      json: ['.claude/**/*.json', '.mcp.json', '.claude-plugin/**/*.json'],
      yaml: ['.claude/**/*.{yaml,yml}'],
      shell: ['.claude/**/*.sh', '.claude/hooks/*'],
    };

    let hasErrors = false;

    // 1. Markdownlint (Tier 1)
    try {
      console.log('Running markdownlint on Claude markdown files...');
      const markdownlintCmd = `markdownlint ${options.check ? '' : '--fix'} '${claudeFiles.markdown.join("' '")}'`;

      if (verbose) {
        console.log(`  Command: ${markdownlintCmd}`);
      }

      try {
        const output = execSync(markdownlintCmd, { encoding: 'utf-8', stdio: 'pipe' });
        if (verbose && output) {
          console.log(output);
        }
        console.log('  ✓ Markdownlint passed\n');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'stdout' in error) {
          console.log(String(error.stdout));
        }
        if (error && typeof error === 'object' && 'stderr' in error) {
          console.error(String(error.stderr));
        }
        hasErrors = true;
        console.log('  [FAIL] Markdownlint found issues\n');
      }
    } catch (error) {
      console.log(
        '  [WARNING] Markdownlint not found (install: npm install -g markdownlint-cli)\n'
      );
    }

    // 2. Prettier (Tier 1)
    try {
      console.log('Running prettier on Claude files...');
      const allFiles = [...claudeFiles.markdown, ...claudeFiles.json, ...claudeFiles.yaml];
      const prettierCmd = `prettier ${options.check ? '--check' : '--write'} ${allFiles.map((f) => `"${f}"`).join(' ')}`;

      if (verbose) {
        console.log(`  Command: ${prettierCmd}`);
      }

      try {
        const output = execSync(prettierCmd, { encoding: 'utf-8', stdio: 'pipe' });
        if (verbose && output) {
          console.log(output);
        }
        console.log('  ✓ Prettier passed\n');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'stdout' in error) {
          console.log(String(error.stdout));
        }
        if (error && typeof error === 'object' && 'stderr' in error) {
          console.error(String(error.stderr));
        }
        hasErrors = true;
        console.log('  [FAIL] Prettier found issues\n');
      }
    } catch (error) {
      console.log('  [WARNING] Prettier not found (install: npm install -g prettier)\n');
    }

    // 3. ShellCheck (Tier 1)
    try {
      console.log('Running shellcheck on Claude shell scripts...');
      const shellCheckCmd = `shellcheck ${claudeFiles.shell.join(' ')}`;

      if (verbose) {
        console.log(`  Command: ${shellCheckCmd}`);
      }

      try {
        const output = execSync(shellCheckCmd, { encoding: 'utf-8', stdio: 'pipe' });
        if (verbose && output) {
          console.log(output);
        }
        console.log('  ✓ ShellCheck passed\n');
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'stdout' in error) {
          console.log(String(error.stdout));
        }
        if (error && typeof error === 'object' && 'stderr' in error) {
          console.error(String(error.stderr));
        }
        hasErrors = true;
        console.log('  [FAIL] ShellCheck found issues\n');
      }
    } catch (error) {
      console.log(
        '  [WARNING] ShellCheck not found (install: brew install shellcheck or npm install -g shellcheck)\n'
      );
    }

    // Summary
    if (hasErrors) {
      console.log('[ERROR] Formatting check failed. Run with --fix to auto-fix issues.\n');
      process.exit(1);
    } else {
      console.log('[SUCCESS] All formatting checks passed!\n');
      process.exit(0);
    }
  });

program
  .command('list-rules')
  .description('List all available validation rules')
  .option(
    '--category <category>',
    'Filter by category (CLAUDE.md, Skills, Settings, Hooks, MCP, Plugin)'
  )
  .option('--format <format>', 'Output format: table, json (default: table)')
  .action((options: { category?: string; format?: string }) => {
    const rules = options.category
      ? RuleRegistry.getByCategory(options.category)
      : RuleRegistry.getAll();

    if (options.format === 'json') {
      console.log(JSON.stringify(rules, null, 2));
      return;
    }

    // Table format (default)
    console.log(`\nAvailable Rules (${rules.length}):\n`);

    // Group by category
    const byCategory = new Map<string, RuleMetadata[]>();
    for (const rule of rules) {
      if (!byCategory.has(rule.category)) {
        byCategory.set(rule.category, []);
      }
      byCategory.get(rule.category)!.push(rule);
    }

    // Print each category
    for (const [category, categoryRules] of byCategory.entries()) {
      console.log(`\n${category}:`);
      categoryRules.forEach((rule: RuleMetadata) => {
        const badge = rule.fixable ? ' [fixable]' : '';
        const severity = rule.severity === 'error' ? '[ERROR]' : '[WARNING]';
        console.log(`  ${severity} ${rule.id}${badge} - ${rule.description}`);
      });
    }

    console.log('');
  });

program
  .command('cache-clear')
  .description('Clear validation cache')
  .option('--cache-location <path>', 'Cache directory', '.claudelint-cache')
  .action((options: { cacheLocation?: string }) => {
    const cache = new ValidationCache({
      enabled: true,
      location: options.cacheLocation || '.claudelint-cache',
      strategy: 'content',
    });

    try {
      cache.clear();
      console.log('Cache cleared successfully');
      process.exit(0);
    } catch (error) {
      console.error('[ERROR] Failed to clear cache:', error);
      process.exit(1);
    }
  });

program.parse();
