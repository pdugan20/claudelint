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
import { registerCacheClearCommand } from './cli/commands/cache-clear';
import { registerInstallPluginCommand } from './cli/commands/install-plugin';

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
  .version(version);

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
registerCacheClearCommand(program);
registerInstallPluginCommand(program);

// Parse command line arguments
program.parse();
