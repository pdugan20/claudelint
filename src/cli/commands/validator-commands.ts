/**
 * Factory for validator commands
 *
 * Creates standardized validator commands (check-claude-md, validate-skills, etc.)
 * Eliminates code duplication through factory pattern
 */

import { Command } from 'commander';
import { ValidatorRegistry } from '../../utils/validators/factory';
import { Reporter } from '../../utils/reporting/reporting';
import { loadAndValidateConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';

/**
 * Metadata for creating a validator command
 */
export interface ValidatorCommandMetadata {
  /** Validator ID (e.g., 'claude-md', 'skills') */
  id: string;
  /** Command name (e.g., 'check-claude-md', 'validate-skills') */
  command: string;
  /** Command description */
  description: string;
  /** Display name for reporting (e.g., 'CLAUDE.md', 'Skills') */
  displayName: string;
  /** Additional command-specific options */
  options?: Array<{ flags: string; description: string }>;
}

/**
 * Creates a validator command with standardized structure
 *
 * All validator commands follow the same pattern:
 * 1. Load and validate config
 * 2. Create validator instance
 * 3. Run validation
 * 4. Report results
 * 5. Exit with appropriate code
 *
 * @param program - Commander program instance
 * @param metadata - Command metadata
 * @returns Command instance for chaining
 */
export function createValidatorCommand(
  program: Command,
  metadata: ValidatorCommandMetadata
): Command {
  const cmd = program
    .command(metadata.command)
    .description(metadata.description)
    .option('--path <path>', `Custom path to ${metadata.displayName}`)
    .option('-v, --verbose', 'Verbose output')
    .option('--warnings-as-errors', 'Treat warnings as errors')
    .option('-c, --config <path>', 'Path to configuration file')
    .option('--no-config', 'Disable configuration file loading');

  // Add command-specific options
  if (metadata.options) {
    for (const opt of metadata.options) {
      cmd.option(opt.flags, opt.description);
    }
  }

  // Add action handler
  cmd.action(
    async (options: {
      path?: string;
      verbose?: boolean;
      warningsAsErrors?: boolean;
      explain?: boolean;
      skill?: string;
      config?: string | false;
    }) => {
      try {
        // Load and validate config (ESLint pattern: load by default, --no-config to opt-out)
        const config = loadAndValidateConfig(options);

        // Create validator with options and config
        const validator = ValidatorRegistry.create(metadata.id, { ...options, config });

        // Create reporter
        const reporter = new Reporter({
          verbose: options.verbose,
          warningsAsErrors: options.warningsAsErrors,
          explain: options.explain,
        });

        reporter.section(`Validating ${metadata.displayName}...`);

        // Run validation
        const result = await validator.validate();

        // Report results
        reporter.report(result, metadata.displayName);

        // Set exit code (use process.exitCode instead of process.exit to allow stdout to drain)
        process.exitCode = reporter.getExitCode(result);
      } catch (error) {
        logger.newline();
        logger.error('Validation failed:');
        logger.error(error instanceof Error ? error.message : String(error));
        if (options.verbose && error instanceof Error && error.stack) {
          logger.newline();
          logger.error('Stack trace:');
          logger.error(error.stack);
        }
        process.exit(2);
      }
    }
  );

  return cmd;
}

/**
 * Register all standard validator commands
 *
 * Creates 6 validator commands:
 * - check-claude-md
 * - validate-skills
 * - validate-settings
 * - validate-hooks
 * - validate-mcp
 * - validate-plugin
 *
 * @param program - Commander program instance
 */
export function registerValidatorCommands(program: Command): void {
  // check-claude-md
  createValidatorCommand(program, {
    id: 'claude-md',
    command: 'check-claude-md',
    description: 'Validate CLAUDE.md files',
    displayName: 'CLAUDE.md',
    options: [
      { flags: '--explain', description: 'Show detailed explanations and fix suggestions' },
    ],
  });

  // validate-skills
  createValidatorCommand(program, {
    id: 'skills',
    command: 'validate-skills',
    description: 'Validate Claude skills',
    displayName: 'Skills',
    options: [{ flags: '--skill <name>', description: 'Validate specific skill' }],
  });

  // validate-settings
  createValidatorCommand(program, {
    id: 'settings',
    command: 'validate-settings',
    description: 'Validate settings.json files',
    displayName: 'Settings',
  });

  // validate-hooks
  createValidatorCommand(program, {
    id: 'hooks',
    command: 'validate-hooks',
    description: 'Validate hooks.json files',
    displayName: 'Hooks',
  });

  // validate-mcp
  createValidatorCommand(program, {
    id: 'mcp',
    command: 'validate-mcp',
    description: 'Validate MCP server configuration files',
    displayName: 'MCP',
  });

  // validate-plugin
  createValidatorCommand(program, {
    id: 'plugin',
    command: 'validate-plugin',
    description: 'Validate plugin manifest files',
    displayName: 'Plugin',
  });
}
