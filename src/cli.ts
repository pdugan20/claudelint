#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('claude-validator')
  .description('Validation toolkit for Claude Code projects')
  .version('0.1.0');

program
  .command('check-all')
  .description('Run all validators')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action((options) => {
    console.log('check-all command - coming soon!');
    console.log('Options:', options);
  });

program
  .command('check-claude-md')
  .description('Validate CLAUDE.md files')
  .option('--path <path>', 'Custom path to CLAUDE.md')
  .option('-v, --verbose', 'Verbose output')
  .action((options) => {
    console.log('check-claude-md command - coming soon!');
    console.log('Options:', options);
  });

program
  .command('validate-skills')
  .description('Validate Claude skills')
  .option('--path <path>', 'Custom path to skills directory')
  .option('--skill <name>', 'Validate specific skill')
  .option('-v, --verbose', 'Verbose output')
  .action((options) => {
    console.log('validate-skills command - coming soon!');
    console.log('Options:', options);
  });

program
  .command('validate-settings')
  .description('Validate settings.json files')
  .option('--path <path>', 'Custom path to settings.json')
  .option('-v, --verbose', 'Verbose output')
  .action((options) => {
    console.log('validate-settings command - coming soon!');
    console.log('Options:', options);
  });

program.parse();
