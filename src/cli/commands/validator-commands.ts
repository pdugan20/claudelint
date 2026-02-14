/**
 * Factory for validator commands
 *
 * Creates standardized validator commands (validate-claude-md, validate-skills, etc.)
 * Eliminates code duplication through factory pattern
 */

import { Command } from 'commander';
import { ValidatorRegistry } from '../../utils/validators/factory';
import { Reporter } from '../../utils/reporting/reporting';
import { loadAndValidateConfig } from '../utils/config-loader';
import { logger } from '../utils/logger';
import { ValidatorOptions } from '../types';
import { addCommonOptions } from '../utils/option-builders';
import { buildReporterOptions } from '../utils/reporter-options';

/**
 * Metadata for creating a validator command
 */
export interface ValidatorCommandMetadata {
  /** Validator ID (e.g., 'claude-md', 'skills') */
  id: string;
  /** Command name (e.g., 'validate-claude-md', 'validate-skills') */
  command: string;
  /** Command description */
  description: string;
  /** Display name for reporting (e.g., 'CLAUDE.md', 'Skills') */
  displayName: string;
  /** Additional command-specific options */
  options?: Array<{ flags: string; description: string }>;
  /** Hidden alias for backwards compatibility */
  alias?: string;
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
    .option('--path <path>', `Custom path to ${metadata.displayName}`);

  // Register shared options
  addCommonOptions(cmd);
  cmd.option('--no-collapse', 'Show all issues without collapsing repeated rules');

  // Add hidden alias for backwards compatibility
  if (metadata.alias) {
    cmd.alias(metadata.alias);
  }

  // Add command-specific options
  if (metadata.options) {
    for (const opt of metadata.options) {
      cmd.option(opt.flags, opt.description);
    }
  }

  // Add action handler
  cmd.action(async (options: ValidatorOptions) => {
    try {
      // Load and validate config (ESLint pattern: load by default, --no-config to opt-out)
      const config = loadAndValidateConfig(options);

      // Create validator with options and config
      const validator = ValidatorRegistry.create(metadata.id, { ...options, config });

      // Create reporter with CLI options taking precedence over config
      const reporter = new Reporter(buildReporterOptions(options, config));

      reporter.section(`Validating ${metadata.displayName}...`);

      // Run validation
      const result = await validator.validate();

      // Report results
      reporter.report(result, metadata.displayName);

      // Check max warnings threshold
      const maxWarnings = options.maxWarnings ?? -1;
      if (maxWarnings >= 0) {
        const warningCount = result.warnings.length;
        if (warningCount > maxWarnings) {
          logger.newline();
          logger.error(`Warning limit exceeded: ${warningCount} > ${maxWarnings}`);
          process.exitCode = 1;
          return;
        }
        // Under threshold — warnings are acceptable, only fail on errors
        if (result.errors.length === 0) {
          process.exitCode = 0;
          return;
        }
      }

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
  });

  return cmd;
}

/**
 * Register all standard validator commands
 *
 * Creates 10 validator commands:
 * - validate-claude-md
 * - validate-skills
 * - validate-settings
 * - validate-hooks
 * - validate-mcp
 * - validate-plugin
 * - validate-agents
 * - validate-lsp
 * - validate-output-styles
 * - validate-commands
 *
 * @param program - Commander program instance
 */
export function registerValidatorCommands(program: Command): void {
  // validate-claude-md
  createValidatorCommand(program, {
    id: 'claude-md',
    command: 'validate-claude-md',
    alias: 'check-claude-md',
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

  // validate-agents
  createValidatorCommand(program, {
    id: 'agents',
    command: 'validate-agents',
    description: 'Validate Claude agent structure and frontmatter',
    displayName: 'Agents',
  });

  // validate-lsp
  createValidatorCommand(program, {
    id: 'lsp',
    command: 'validate-lsp',
    description: 'Validate LSP configuration files',
    displayName: 'LSP',
  });

  // validate-output-styles
  createValidatorCommand(program, {
    id: 'output-styles',
    command: 'validate-output-styles',
    description: 'Validate output style structure and frontmatter',
    displayName: 'Output Styles',
  });

  // validate-commands
  createValidatorCommand(program, {
    id: 'commands',
    command: 'validate-commands',
    description: 'Detect deprecated Commands usage and suggest migration to Skills',
    displayName: 'Commands',
  });
}
