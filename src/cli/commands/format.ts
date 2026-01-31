/**
 * format command - Format Claude files with markdownlint, prettier, and shellcheck
 */

import { Command } from 'commander';
import { execSync } from 'child_process';
import { logger } from '../utils/logger';
import { checkPrettier, formatPrettier } from '../utils/formatters/prettier';
import { checkMarkdownlint } from '../utils/formatters/markdownlint';
import { isShellCheckAvailable, getShellCheckInstallMessage } from '../utils/system-tools';
import { glob } from 'glob';

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
    .action(async (options: { check?: boolean; fix?: boolean; verbose?: boolean }) => {
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

        const result = await checkMarkdownlint(claudeFiles.markdown, !options.check);

        if (verbose && result.filesWithErrors.length > 0) {
          for (const [file, errors] of Object.entries(result.errors)) {
            logger.detail(`${file}:`);
            errors.forEach((error) => logger.detail(`  ${error}`));
          }
        }

        if (result.passed) {
          logger.success('Markdownlint passed');
          logger.newline();
        } else {
          hasErrors = true;
          logger.error(`Markdownlint found issues in ${result.filesWithErrors.length} file(s)`);
          logger.newline();
        }
      } catch (error) {
        logger.warn('Markdownlint check failed');
        logger.newline();
      }

      // 2. Prettier (Tier 1)
      try {
        logger.info('Running prettier on Claude files...');
        const allFiles = [...claudeFiles.markdown, ...claudeFiles.json, ...claudeFiles.yaml];

        const result = options.check
          ? await checkPrettier(allFiles)
          : await formatPrettier(allFiles);

        if (verbose) {
          if (result.errors.length > 0) {
            logger.detail('Files with issues:');
            result.errors.forEach((file) => logger.detail(`  ${file}`));
          }
          if (result.formatted.length > 0 && !options.check) {
            logger.detail('Files formatted:');
            result.formatted.forEach((file) => logger.detail(`  ${file}`));
          }
        }

        if (result.passed) {
          logger.success('Prettier passed');
          logger.newline();
        } else {
          hasErrors = true;
          logger.error(`Prettier found issues in ${result.errors.length} file(s)`);
          logger.newline();
        }
      } catch (error) {
        logger.warn('Prettier check failed');
        logger.newline();
      }

      // 3. ShellCheck (Optional - system binary)
      if (isShellCheckAvailable()) {
        logger.info('Running ShellCheck on shell scripts...');

        // Expand glob patterns to actual files
        const shellFiles: string[] = [];
        for (const pattern of claudeFiles.shell) {
          const matches = await glob(pattern, { ignore: ['node_modules/**'] });
          shellFiles.push(...matches);
        }

        // Filter out non-shell files (JSON, etc.)
        const uniqueShellFiles = [...new Set(shellFiles)].filter(
          (file) => !file.endsWith('.json') && !file.endsWith('.md')
        );

        if (uniqueShellFiles.length > 0) {
          try {
            const shellCheckCmd = `shellcheck ${uniqueShellFiles.join(' ')}`;

            if (verbose) {
              logger.detail(`Files: ${uniqueShellFiles.join(', ')}`);
            }

            const output = execSync(shellCheckCmd, { encoding: 'utf-8', stdio: 'pipe' });
            if (verbose && output) {
              logger.log(output);
            }
            logger.success('ShellCheck passed');
            logger.newline();
          } catch (error: unknown) {
            if (error && typeof error === 'object' && 'stdout' in error) {
              logger.log(String(error.stdout));
            }
            if (error && typeof error === 'object' && 'stderr' in error) {
              logger.error(String(error.stderr));
            }
            hasErrors = true;
            logger.error('ShellCheck found issues');
            logger.newline();
          }
        } else {
          if (verbose) {
            logger.detail('No shell scripts found to check');
          }
          logger.newline();
        }
      } else {
        logger.warn('ShellCheck not installed (optional)');
        logger.detail(getShellCheckInstallMessage());
        logger.detail('Shell scripts will skip linting');
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
