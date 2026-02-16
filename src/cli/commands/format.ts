/**
 * format command - Format Claude files with markdownlint, prettier, and shellcheck
 */

import { Command } from 'commander';
import { execFileSync } from 'child_process';
import { logger } from '../utils/logger';
import { checkPrettier, formatPrettier } from '../utils/formatters/prettier';
import { checkMarkdownlint, fixMarkdownlint } from '../utils/formatters/markdownlint';
import { isShellCheckAvailable, getShellCheckInstallMessage } from '../utils/system-tools';
import { findAllFormattableFiles } from '../../utils/filesystem/files';

interface FormatSummary {
  checked: number;
  formatted: number;
  errors: number;
  errorFiles: string[];
}

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
    .option('--fix-dry-run', 'Preview what would be fixed without writing')
    .option('-v, --verbose', 'Verbose output')
    .action(
      async (options: {
        check?: boolean;
        fix?: boolean;
        fixDryRun?: boolean;
        verbose?: boolean;
      }) => {
        const isDryRun = options.fixDryRun === true;
        const isCheck = options.check === true || isDryRun;
        const mode = isDryRun ? 'dry-run' : isCheck ? 'check' : 'fix';
        const verbose = options.verbose || false;

        logger.section(`Formatting Claude files (${mode} mode)`);

        // Discover files using centralized patterns
        const claudeFiles = await findAllFormattableFiles();

        const summary: FormatSummary = { checked: 0, formatted: 0, errors: 0, errorFiles: [] };
        let hasErrors = false;

        // 1. Markdownlint (Tier 1)
        try {
          logger.info('Running markdownlint on Claude markdown files...');

          const shouldFix = !isCheck;
          const result = shouldFix
            ? await fixMarkdownlint(claudeFiles.markdown)
            : await checkMarkdownlint(claudeFiles.markdown);

          summary.checked += claudeFiles.markdown.length;

          if (verbose && result.filesWithErrors.length > 0) {
            for (const [file, errors] of Object.entries(result.errors)) {
              logger.detail(`${file}:`);
              errors.forEach((error) => logger.detail(`  ${error}`));
            }
          }

          if (shouldFix && result.filesFixed.length > 0) {
            summary.formatted += result.filesFixed.length;
            if (verbose) {
              logger.detail('Files fixed:');
              result.filesFixed.forEach((file) => logger.detail(`  ${file}`));
            }
          }

          if (result.passed) {
            logger.success('Markdownlint passed');
            logger.newline();
          } else {
            hasErrors = true;
            summary.errors += result.filesWithErrors.length;
            summary.errorFiles.push(...result.filesWithErrors);
            logger.error(`Markdownlint found issues in ${result.filesWithErrors.length} file(s)`);
            logger.newline();
          }
        } catch {
          logger.warn('Markdownlint check failed');
          logger.newline();
        }

        // 2. Prettier (Tier 1)
        try {
          logger.info('Running prettier on Claude files...');
          const allPrettierFiles = [
            ...claudeFiles.markdown,
            ...claudeFiles.json,
            ...claudeFiles.yaml,
          ];

          summary.checked += allPrettierFiles.length;

          const result = isCheck
            ? await checkPrettier(allPrettierFiles)
            : await formatPrettier(allPrettierFiles);

          if (verbose) {
            if (result.errors.length > 0) {
              logger.detail('Files with issues:');
              result.errors.forEach((file) => logger.detail(`  ${file}`));
            }
            if (result.formatted.length > 0 && !isCheck) {
              logger.detail('Files formatted:');
              result.formatted.forEach((file) => logger.detail(`  ${file}`));
            }
          }

          if (!isCheck) {
            summary.formatted += result.formatted.length;
          }

          if (result.passed) {
            logger.success('Prettier passed');
            logger.newline();
          } else {
            hasErrors = true;
            summary.errors += result.errors.length;
            summary.errorFiles.push(...result.errors);
            logger.error(`Prettier found issues in ${result.errors.length} file(s)`);
            logger.newline();
          }
        } catch {
          logger.warn('Prettier check failed');
          logger.newline();
        }

        // 3. ShellCheck (Optional - system binary)
        if (isShellCheckAvailable()) {
          logger.info('Running ShellCheck on shell scripts...');

          const uniqueShellFiles = claudeFiles.shell.filter(
            (file) => !file.endsWith('.json') && !file.endsWith('.md')
          );

          summary.checked += uniqueShellFiles.length;

          if (uniqueShellFiles.length > 0) {
            try {
              if (verbose) {
                logger.detail(`Files: ${uniqueShellFiles.join(', ')}`);
              }

              const output = execFileSync('shellcheck', uniqueShellFiles, {
                encoding: 'utf-8',
                stdio: 'pipe',
              });
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
              summary.errors += uniqueShellFiles.length;
              summary.errorFiles.push(...uniqueShellFiles);
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
        logger.info(
          `${summary.checked} files checked, ${summary.formatted} formatted, ${summary.errors} with errors`
        );

        if (isCheck && summary.errorFiles.length > 0) {
          logger.newline();
          logger.info('Files needing formatting:');
          const unique = [...new Set(summary.errorFiles)];
          unique.forEach((file) => logger.detail(`  ${file}`));
        }

        if (hasErrors) {
          logger.newline();
          if (isCheck) {
            logger.error('Formatting check failed. Run without --check to auto-fix issues.');
          } else {
            logger.error('Some issues could not be auto-fixed.');
          }
          process.exit(1);
        } else {
          logger.newline();
          logger.success('All formatting checks passed!');
          process.exit(0);
        }
      }
    );
}
