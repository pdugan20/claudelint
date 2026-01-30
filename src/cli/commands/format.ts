/**
 * format command - Format Claude files with markdownlint, prettier, and shellcheck
 */

import { Command } from 'commander';
import { execSync } from 'child_process';

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

      console.log(`\nFormatting Claude files (${mode} mode)...\n`);

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
        console.log('Running markdownlint on Claude markdown files...');
        const markdownlintCmd = `markdownlint ${options.check ? '' : '--fix'} '${claudeFiles.markdown.join("' '")}'`;

        if (verbose) {
          console.log(`  Command: ${markdownlintCmd}`);
        }

        try {
          const output = execSync(markdownlintCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          console.log('  ✓ Markdownlint passed\n');
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          console.log('  [FAIL] Markdownlint found issues\n');
        }
      } catch (error) {
        console.log(
          '  [WARNING] Markdownlint not found (install: npm install -g markdownlint-cli)\n'
        );
      }

      // 2. Prettier (Tier 1)
      try {
        console.log('Running prettier on Claude files...');
        const allFiles = [...claudeFiles.markdown, ...claudeFiles.json, ...claudeFiles.yaml];
        const prettierCmd = `prettier ${options.check ? '--check' : '--write'} ${allFiles.map((f) => `"${f}"`).join(' ')}`;

        if (verbose) {
          console.log(`  Command: ${prettierCmd}`);
        }

        try {
          const output = execSync(prettierCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          console.log('  ✓ Prettier passed\n');
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          console.log('  [FAIL] Prettier found issues\n');
        }
      } catch (error) {
        console.log('  [WARNING] Prettier not found (install: npm install -g prettier)\n');
      }

      // 3. ShellCheck (Tier 1)
      try {
        console.log('Running shellcheck on Claude shell scripts...');
        const shellCheckCmd = `shellcheck ${claudeFiles.shell.join(' ')}`;

        if (verbose) {
          console.log(`  Command: ${shellCheckCmd}`);
        }

        try {
          const output = execSync(shellCheckCmd, { encoding: 'utf-8', stdio: 'pipe' });
          if (verbose && output) {
            console.log(output);
          }
          console.log('  ✓ ShellCheck passed\n');
        } catch (error: unknown) {
          if (error && typeof error === 'object' && 'stdout' in error) {
            console.log(String(error.stdout));
          }
          if (error && typeof error === 'object' && 'stderr' in error) {
            console.error(String(error.stderr));
          }
          hasErrors = true;
          console.log('  [FAIL] ShellCheck found issues\n');
        }
      } catch (error) {
        console.log(
          '  [WARNING] ShellCheck not found (install: brew install shellcheck or npm install -g shellcheck)\n'
        );
      }

      // Summary
      if (hasErrors) {
        console.log('[ERROR] Formatting check failed. Run with --fix to auto-fix issues.\n');
        process.exit(1);
      } else {
        console.log('[SUCCESS] All formatting checks passed!\n');
        process.exit(0);
      }
    });
}
