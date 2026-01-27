#!/usr/bin/env node

import { Command } from 'commander';
import { ClaudeMdValidator } from './validators/claude-md';
import { SkillsValidator } from './validators/skills';
import { SettingsValidator } from './validators/settings';
import { HooksValidator } from './validators/hooks';
import { Reporter } from './utils/reporting';

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
  .action(async (options: { verbose?: boolean; warningsAsErrors?: boolean }) => {
    const reporter = new Reporter({
      verbose: options.verbose,
      warningsAsErrors: options.warningsAsErrors,
    });

    let totalErrors = 0;
    let totalWarnings = 0;

    // Run CLAUDE.md validator
    reporter.section('Validating CLAUDE.md files...');
    const claudeMdValidator = new ClaudeMdValidator(options);
    const claudeMdResult = await claudeMdValidator.validate();
    reporter.report(claudeMdResult, 'CLAUDE.md');
    totalErrors += claudeMdResult.errors.length;
    totalWarnings += claudeMdResult.warnings.length;

    // Run Skills validator
    reporter.section('Validating skills...');
    const skillsValidator = new SkillsValidator(options);
    const skillsResult = await skillsValidator.validate();
    reporter.report(skillsResult, 'Skills');
    totalErrors += skillsResult.errors.length;
    totalWarnings += skillsResult.warnings.length;

    // Run Settings validator
    reporter.section('Validating settings...');
    const settingsValidator = new SettingsValidator(options);
    const settingsResult = await settingsValidator.validate();
    reporter.report(settingsResult, 'Settings');
    totalErrors += settingsResult.errors.length;
    totalWarnings += settingsResult.warnings.length;

    // Run Hooks validator
    reporter.section('Validating hooks...');
    const hooksValidator = new HooksValidator(options);
    const hooksResult = await hooksValidator.validate();
    reporter.report(hooksResult, 'Hooks');
    totalErrors += hooksResult.errors.length;
    totalWarnings += hooksResult.warnings.length;

    // Overall summary
    console.log('\n=== Overall Summary ===');
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Total warnings: ${totalWarnings}`);

    // Exit with appropriate code
    if (totalErrors > 0) {
      process.exit(2);
    } else if (totalWarnings > 0 && options.warningsAsErrors) {
      process.exit(1);
    } else if (totalWarnings > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });

program
  .command('check-claude-md')
  .description('Validate CLAUDE.md files')
  .option('--path <path>', 'Custom path to CLAUDE.md')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    const validator = new ClaudeMdValidator(options);
    const reporter = new Reporter({
      verbose: options.verbose,
      warningsAsErrors: options.warningsAsErrors,
    });

    reporter.section('Validating CLAUDE.md files...');

    const result = await validator.validate();

    reporter.report(result, 'CLAUDE.md');

    process.exit(reporter.getExitCode(result));
  });

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
      const validator = new SkillsValidator(options);
      const reporter = new Reporter({
        verbose: options.verbose,
        warningsAsErrors: options.warningsAsErrors,
      });

      reporter.section('Validating Claude skills...');

      const result = await validator.validate();

      reporter.report(result, 'Skills');

      process.exit(reporter.getExitCode(result));
    }
  );

program
  .command('validate-settings')
  .description('Validate settings.json files')
  .option('--path <path>', 'Custom path to settings.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    const validator = new SettingsValidator(options);
    const reporter = new Reporter({
      verbose: options.verbose,
      warningsAsErrors: options.warningsAsErrors,
    });

    reporter.section('Validating settings.json files...');

    const result = await validator.validate();

    reporter.report(result, 'Settings');

    process.exit(reporter.getExitCode(result));
  });

program
  .command('validate-hooks')
  .description('Validate hooks.json files')
  .option('--path <path>', 'Custom path to hooks.json')
  .option('-v, --verbose', 'Verbose output')
  .option('--warnings-as-errors', 'Treat warnings as errors')
  .action(async (options: { path?: string; verbose?: boolean; warningsAsErrors?: boolean }) => {
    const validator = new HooksValidator(options);
    const reporter = new Reporter({
      verbose: options.verbose,
      warningsAsErrors: options.warningsAsErrors,
    });

    reporter.section('Validating hooks.json files...');

    const result = await validator.validate();

    reporter.report(result, 'Hooks');

    process.exit(reporter.getExitCode(result));
  });

program.parse();
