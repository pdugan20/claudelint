/**
 * watch command - Watch for file changes and re-validate
 *
 * Monitors the working directory for changes to Claude configuration files
 * and re-runs the appropriate validators when changes are detected.
 */

import { Command } from 'commander';
import { watch, FSWatcher } from 'fs';
import { resolve, relative, extname } from 'path';
import { ValidatorRegistry } from '../../utils/validators/factory';
import { Reporter } from '../../utils/reporting/reporting';
import { loadAndValidateConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/** File patterns that trigger specific validators */
const VALIDATOR_TRIGGERS: Record<string, string[]> = {
  'claude-md': ['CLAUDE.md'],
  skills: ['SKILL.md', '.sh'],
  settings: ['settings.json'],
  hooks: ['hooks.json'],
  mcp: ['.mcp.json'],
  plugin: ['plugin.json'],
};

/**
 * Determine which validators to run based on changed file
 */
function getTriggeredValidators(filePath: string): string[] {
  const triggered: string[] = [];

  for (const [validatorId, patterns] of Object.entries(VALIDATOR_TRIGGERS)) {
    for (const pattern of patterns) {
      if (filePath.endsWith(pattern)) {
        triggered.push(validatorId);
        break;
      }
    }
  }

  return triggered;
}

/**
 * Register the watch command
 */
export function registerWatchCommand(program: Command): void {
  program
    .command('watch')
    .description('Watch for file changes and re-validate automatically')
    .option('-v, --verbose', 'Verbose output')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('--no-config', 'Disable configuration file loading')
    .option('--debounce <ms>', 'Debounce interval in milliseconds', '300')
    .action(
      async (options: {
        verbose?: boolean;
        warningsAsErrors?: boolean;
        config?: string | false;
        debounce?: string;
      }) => {
        const debounceMs = parseInt(options.debounce || '300', 10);
        const cwd = process.cwd();

        logger.info('Watching for changes...');
        logger.info(`Directory: ${cwd}`);
        logger.info('Press Ctrl+C to stop');
        logger.newline();

        // Run initial validation
        await runAllValidators(options);

        // Set up file watcher
        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        let pendingFiles = new Set<string>();
        let watcher: FSWatcher;

        try {
          watcher = watch(cwd, { recursive: true }, (_event, filename) => {
            if (!filename) return;

            const fullPath = resolve(cwd, filename);
            const ext = extname(filename);

            // Only watch relevant file types
            if (!['.md', '.json', '.sh'].includes(ext)) return;

            // Skip node_modules and cache
            if (filename.includes('node_modules') || filename.includes('.claudelint-cache')) {
              return;
            }

            pendingFiles.add(fullPath);

            // Debounce to batch rapid changes
            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
              const files = Array.from(pendingFiles);
              pendingFiles = new Set<string>();

              // Determine which validators to run
              const validatorIds = new Set<string>();
              for (const file of files) {
                const relPath = relative(cwd, file);
                const triggered = getTriggeredValidators(relPath);

                if (triggered.length === 0) {
                  // Unknown file type - run all validators
                  for (const id of Object.keys(VALIDATOR_TRIGGERS)) {
                    validatorIds.add(id);
                  }
                } else {
                  for (const id of triggered) {
                    validatorIds.add(id);
                  }
                }
              }

              logger.newline();
              const relFiles = files.map((f) => relative(cwd, f)).join(', ');
              logger.info(`Change detected: ${relFiles}`);

              void runSelectedValidators(options, Array.from(validatorIds));
            }, debounceMs);
          });
        } catch (error) {
          logger.error(
            `Failed to start watcher: ${error instanceof Error ? error.message : String(error)}`
          );
          process.exit(2);
        }

        // Handle SIGINT
        process.on('SIGINT', () => {
          logger.newline();
          logger.info('Stopping watcher...');
          watcher.close();
          process.exit(0);
        });
      }
    );
}

/**
 * Run all validators
 */
async function runAllValidators(options: {
  verbose?: boolean;
  warningsAsErrors?: boolean;
  config?: string | false;
}): Promise<void> {
  const config = loadAndValidateConfig(options);
  const reporter = new Reporter({
    verbose: options.verbose,
    warningsAsErrors: options.warningsAsErrors,
    color: true,
  });

  const enabledValidators = ValidatorRegistry.getAllMetadata().filter((m) => m.enabled);

  const results = await Promise.all(
    enabledValidators.map((metadata) =>
      reporter.runValidator(metadata.name, () =>
        ValidatorRegistry.create(metadata.id, { ...options, config }).validate()
      )
    )
  );

  reporter.reportParallelResults(results);

  const totalErrors = results.reduce((sum, r) => sum + r.result.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.result.warnings.length, 0);

  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success('All checks passed');
  } else {
    logger.info(`${totalErrors} errors, ${totalWarnings} warnings`);
  }
}

/**
 * Run specific validators
 */
async function runSelectedValidators(
  options: {
    verbose?: boolean;
    warningsAsErrors?: boolean;
    config?: string | false;
  },
  validatorIds: string[]
): Promise<void> {
  const config = loadAndValidateConfig(options);
  const reporter = new Reporter({
    verbose: options.verbose,
    warningsAsErrors: options.warningsAsErrors,
    color: true,
  });

  const allMetadata = ValidatorRegistry.getAllMetadata();
  const selectedMetadata = allMetadata.filter((m) => m.enabled && validatorIds.includes(m.id));

  if (selectedMetadata.length === 0) return;

  const results = await Promise.all(
    selectedMetadata.map((metadata) =>
      reporter.runValidator(metadata.name, () =>
        ValidatorRegistry.create(metadata.id, { ...options, config }).validate()
      )
    )
  );

  reporter.reportParallelResults(results);

  const totalErrors = results.reduce((sum, r) => sum + r.result.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.result.warnings.length, 0);

  if (totalErrors === 0 && totalWarnings === 0) {
    logger.success('All checks passed');
  } else {
    logger.info(`${totalErrors} errors, ${totalWarnings} warnings`);
  }
}
