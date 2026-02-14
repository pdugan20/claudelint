#!/usr/bin/env node

/**
 * claudelint CLI - Main entry point
 *
 * This file is intentionally kept small (~200 lines) following ESLint/Prettier patterns.
 * Command implementations are in src/cli/commands/
 * Utilities are in src/cli/utils/
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

// Import validators to ensure self-registration
import './validators';

// Import command registration functions
import { registerCheckAllCommand } from './cli/commands/check-all';
import { registerValidatorCommands } from './cli/commands/validator-commands';
import { registerConfigCommands } from './cli/commands/config-commands';
import { registerFormatCommand } from './cli/commands/format';
import { registerListRulesCommand } from './cli/commands/list-rules';
import { registerCheckDeprecatedCommand } from './cli/commands/check-deprecated';
import { registerMigrateCommand } from './cli/commands/migrate';
import { registerCacheClearCommand } from './cli/commands/cache-clear';
import { registerInstallPluginCommand } from './cli/commands/install-plugin';
import { registerWatchCommand } from './cli/commands/watch';
import { registerExplainCommand } from './cli/commands/explain';

// Read version from package.json
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string };
const version: string = packageJson.version;

// Create Commander program
const program = new Command();

// Program metadata
program
  .name('claudelint')
  .description('A comprehensive linter for Claude Code projects')
  .version(`claudelint v${version}`)
  .addHelpText(
    'after',
    `
Examples:
  claudelint                                Lint the current project
  claudelint --fix                          Lint and auto-fix problems
  claudelint --format json -o report.json   Save JSON report to file
  claudelint --changed                      Lint only uncommitted changes
  claudelint init                           Set up configuration
  claudelint explain <rule-id>              Get detailed rule documentation

Documentation: https://claudelint.com`
  );

// Register all commands
// =====================

// Primary command - run all validators
registerCheckAllCommand(program);

// Individual validator commands (6 commands via factory)
registerValidatorCommands(program);

// Configuration commands (4 commands)
registerConfigCommands(program);

// Utility commands
registerFormatCommand(program);
registerListRulesCommand(program);
registerCheckDeprecatedCommand(program);
registerMigrateCommand(program);
registerCacheClearCommand(program);
registerInstallPluginCommand(program);
registerWatchCommand(program);
registerExplainCommand(program);

// Parse command line arguments
program.parse();

// Check for updates (non-blocking, respects NO_UPDATE_NOTIFIER and CI)
import { checkForUpdate } from './cli/utils/update-check';
const updateMessage = checkForUpdate(version);
if (updateMessage) {
  // Use stderr so it doesn't interfere with JSON/piped output
  process.stderr.write(`\n${updateMessage}\n`);
}
