/**
 * format command - Format Claude files with markdownlint, prettier, and shellcheck
 */

import { Command } from 'commander';
import { execSync } from 'child_process';
import { logger } from '../utils/logger';

/**
 * Register the format command
 *
 * @param program - Commander program instance
 */
export function registerFormatCommand(program: Command): void {
  program
    .command('format')
    .description('Format Claude files with markdownlint, prettier, and shellcheck')
    .option('--check', 'Check formatting without making changes')
    .option('--fix', 'Fix formatting issues (default)')
    .option('-v, --verbose', 'Verbose output')
    .action((options: { check?: boolean; fix?: boolean; verbose?: boolean }) => {
      const mode = options.check ? 'check' : 'fix';
      const verbose = options.verbose || false;

      logger.section(`Formatting Claude files (${mode} mode)`);

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
        logger.info('Running markdownlint on Claude markdown files...');
        const markdownlintCmd = `markdownlint ${options.check ? '' : '--fix'} '${claudeFiles.markdown.join("' '")}'`;

        if (verbose) {
          logger.log(`  Command: ${markdownlintCmd}`);
        }

        try {
          const output = execSync(markdownlintCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          logger.success('Markdownlint passed');
          logger.newline();
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          logger.error('Markdownlint found issues');
          logger.newline();
        }
      } catch (error) {
        logger.warn('Markdownlint not found (install: npm install -g markdownlint-cli)');
        logger.newline();
      }

      // 2. Prettier (Tier 1)
      try {
        logger.info('Running prettier on Claude files...');
        const allFiles = [...claudeFiles.markdown, ...claudeFiles.json, ...claudeFiles.yaml];
        const prettierCmd = `prettier ${options.check ? '--check' : '--write'} ${allFiles.map((f) => `"${f}"`).join(' ')}`;

        if (verbose) {
          logger.log(`  Command: ${prettierCmd}`);
        }

        try {
          const output = execSync(prettierCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          logger.success('Prettier passed');
          logger.newline();
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          logger.error('Prettier found issues');
          logger.newline();
        }
      } catch (error) {
        logger.warn('Prettier not found (install: npm install -g prettier)');
        logger.newline();
      }

      // 3. ShellCheck (Tier 1)
      try {
        logger.info('Running shellcheck on Claude shell scripts...');
        const shellCheckCmd = `shellcheck ${claudeFiles.shell.join(' ')}`;

        if (verbose) {
          logger.log(`  Command: ${shellCheckCmd}`);
        }

        try {
          const output = execSync(shellCheckCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          logger.success('ShellCheck passed');
          logger.newline();
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          logger.error('ShellCheck found issues');
          logger.newline();
        }
      } catch (error) {
        logger.warn('ShellCheck not found (install: brew install shellcheck or npm install -g shellcheck)');
        logger.newline();
      }

      // Summary
      if (hasErrors) {
        logger.error('Formatting check failed. Run with --fix to auto-fix issues.');
        process.exit(1);
      } else {
        logger.success('All formatting checks passed!');
        process.exit(0);
      }
    });
}
