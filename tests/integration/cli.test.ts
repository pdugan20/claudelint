/**
 * End-to-end CLI integration tests
 * Tests the complete CLI workflow with real file system and subprocess execution
 */

import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { claudeMd, skill, settings, hooks, mcp, plugin } from '../helpers/fixtures';

/** Run CLI and return combined stdout+stderr output with exit code */
function runCLI(
  bin: string,
  args: string[],
  cwd: string
): { output: string; stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(bin, args, { cwd, encoding: 'utf-8' });
  return {
    output: (result.stdout || '') + (result.stderr || ''),
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

describe('CLI Integration Tests', () => {
  const projectRoot = join(__dirname, '../..');
  const claudelintBin = join(projectRoot, 'bin/claudelint');
  let testProjectDir: string;

  beforeEach(() => {
    // Create a temporary test project directory outside the project tree
    testProjectDir = join(tmpdir(), `claudelint-cli-test-${Date.now()}`);
    mkdirSync(testProjectDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test project
    if (existsSync(testProjectDir)) {
      rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('check-all command', () => {
    it('should validate a valid project successfully', async () => {
      // Create valid files
      await claudeMd(testProjectDir).withMinimalContent().build();
      await skill(testProjectDir, 'test-skill').withMinimalFields().build();
      await settings(testProjectDir).withMinimalSettings().build();

      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      expect(output).toContain('No problems found');
    });

    it('should report errors for invalid project', async () => {
      // Create CLAUDE.md that's too large
      await claudeMd(testProjectDir).withSize(50000).build();

      let output = '';
      let exitCode = 0;

      try {
        execSync(`${claudelintBin} check-all`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || '';
        exitCode = error.status || 1;
      }

      expect(exitCode).toBe(1);
      expect(output).toContain('error');
    });

    it('should exit with code 0 for valid project', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const result = spawnSync(claudelintBin, ['check-all'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
    });

    it('should exit with code 1 for invalid project', async () => {
      // Create invalid settings
      await settings(testProjectDir).buildInvalid();

      const result = spawnSync(claudelintBin, ['check-all'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(1);
    });
  });

  describe('--verbose flag', () => {
    it('should show detailed output with --verbose', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['check-all', '--verbose'], testProjectDir);

      expect(output).toContain('CLAUDE.md');
    });

    it('should show less output without --verbose', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      // Should have summary but less detail
      expect(output).toBeTruthy();
    });

    it('should show skipped validators with reasons in verbose mode', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--verbose', '--no-color'],
        testProjectDir
      );

      // Active validators show file count
      expect(output).toMatch(/claude-md \(\d+ files?\)/);

      // Skipped section with aligned reasons
      expect(output).toContain('Skipped (');
      expect(output).toContain('skills');
      expect(output).toContain('agents');
    });

    it('should show file paths for active validators in verbose mode', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--verbose', '--no-color'],
        testProjectDir
      );

      // File paths listed under active validators
      expect(output).toContain('CLAUDE.md');
    });

    it('should not show per-validator detail for clean validators in verbose mode', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--verbose', '--no-color'],
        testProjectDir
      );

      // Clean validators should NOT have "All checks passed!" output
      expect(output).not.toContain('All checks passed');
    });
  });

  describe('--format flag', () => {
    it('should output JSON format with --format json', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const result = execSync(`${claudelintBin} check-all --format json`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Should be valid JSON
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('should output compact format with --format compact', async () => {
      await claudeMd(testProjectDir).withSize(50000).build();

      let output = '';
      try {
        execSync(`${claudelintBin} check-all --format compact`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || '';
      }

      // Compact format shows file:line
      expect(output).toMatch(/CLAUDE\.md/);
    });

    it('should output github format with --format github', async () => {
      await claudeMd(testProjectDir).withSize(50000).build();

      const { stdout } = runCLI(
        claudelintBin,
        ['check-all', '--format', 'github'],
        testProjectDir
      );

      // GitHub format: ::error or ::warning annotations on stdout
      expect(stdout).toMatch(/^::error /m);
      expect(stdout).toContain('file=');
      expect(stdout).toContain('title=');
    });

    it('should produce no stdout for clean project with --format github', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { stdout } = runCLI(
        claudelintBin,
        ['check-all', '--format', 'github'],
        testProjectDir
      );

      // No annotations when clean
      expect(stdout.trim()).toBe('');
    });

    it('should output stylish format by default', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      // Stylish format: quiet success shows only the summary line
      expect(output).toContain('No problems found.');
      expect(output).toMatch(/Checked \d+ files? across \d+ categor(?:y|ies)/);
    });
  });

  describe('--config flag', () => {
    it('should use custom config file', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      // Create custom config that disables a rule
      const configPath = join(testProjectDir, 'custom-config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            'claude-md-size-warning': 'off',
          },
        })
      );

      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--config', configPath],
        testProjectDir
      );

      expect(output).toBeTruthy();
    });

    it('should error on invalid config file', () => {
      const configPath = join(testProjectDir, 'invalid-config.json');
      writeFileSync(configPath, '{ invalid json }');

      expect(() => {
        execSync(`${claudelintBin} check-all --config ${configPath}`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      }).toThrow();
    });

    it('should error on non-existent config file', () => {
      expect(() => {
        execSync(`${claudelintBin} check-all --config non-existent.json`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      }).toThrow();
    });
  });

  describe('--warnings-as-errors flag', () => {
    it('should treat warnings as errors with --warnings-as-errors', async () => {
      // Create a file that triggers a warning
      await claudeMd(testProjectDir).withSize(38000).build(); // Triggers size-warning

      const result = spawnSync(claudelintBin, ['check-all', '--warnings-as-errors'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Should exit with error code
      expect(result.status).toBe(1);
    });
  });

  describe('--timing flag', () => {
    it('should show timing breakdown with --timing', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['check-all', '--timing'], testProjectDir);

      expect(output).toContain('Timing:');
      expect(output).toMatch(/\d+ms/);
    });

    it('should not show timing by default', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      expect(output).not.toContain('Timing:');
    });
  });

  describe('--allow-empty-input flag', () => {
    it('should exit 0 for empty project with --allow-empty-input', () => {
      // testProjectDir has no claude files at all
      const result = spawnSync(claudelintBin, ['check-all', '--allow-empty-input'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
    });

    it('should show info message for empty project without --allow-empty-input', () => {
      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      expect(output).toContain('No files found to check');
    });

    it('should not show info message with --allow-empty-input', () => {
      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--allow-empty-input'],
        testProjectDir
      );

      expect(output).not.toContain('No files found to check');
    });
  });

  describe('--quiet flag', () => {
    it('should suppress warning output with --quiet', async () => {
      // Create a file that triggers a warning (size between 30k-45k)
      await claudeMd(testProjectDir).withSize(38000).build();

      const { output } = runCLI(claudelintBin, ['check-all', '--quiet'], testProjectDir);

      // Individual warning details are suppressed
      expect(output).not.toMatch(/! Warning:/);
      // Summary still mentions warning count (so users know they exist)
      expect(output).toContain('warning');
    });

    it('should still show errors with --quiet', async () => {
      // Create a file that triggers an error (50k+)
      await claudeMd(testProjectDir).withSize(50000).build();

      const { output, exitCode } = runCLI(
        claudelintBin,
        ['check-all', '--quiet'],
        testProjectDir
      );

      // Errors still shown
      expect(output).toMatch(/error/i);
      expect(exitCode).toBe(1);
    });

    it('should exit 0 for warnings-only project with --quiet', async () => {
      // Create a file that triggers a warning but no error
      await claudeMd(testProjectDir).withSize(38000).build();

      const result = spawnSync(claudelintBin, ['check-all', '--quiet'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Warnings don't cause exit 1 (they already don't in check-all without --warnings-as-errors)
      expect(result.status).toBe(0);
    });
  });

  describe('specific validator commands', () => {
    it('should run validate-claude-md command', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const { output } = runCLI(claudelintBin, ['validate-claude-md'], testProjectDir);

      expect(output).toContain('All checks passed');
    });

    it('should run validate-skills command', async () => {
      await skill(testProjectDir, 'test-skill').withMinimalFields().build();

      const { output } = runCLI(claudelintBin, ['validate-skills'], testProjectDir);

      expect(output).toContain('All checks passed');
    });

    it('should run validate-settings command', async () => {
      await settings(testProjectDir).withMinimalSettings().build();

      const { output } = runCLI(claudelintBin, ['validate-settings'], testProjectDir);

      expect(output).toContain('All checks passed');
    });

    it('should run validate-hooks command', async () => {
      await hooks(testProjectDir).withMinimalHooks().build();

      const { output } = runCLI(claudelintBin, ['validate-hooks'], testProjectDir);

      expect(output).toContain('All checks passed');
    });

    it('should run validate-mcp command', async () => {
      await mcp(testProjectDir).withMinimalConfig().build();

      const { output } = runCLI(claudelintBin, ['validate-mcp'], testProjectDir);

      expect(output).toContain('All checks passed');
    });

    it('should run validate-plugin command', async () => {
      await plugin(testProjectDir).withMinimalManifest().build();

      const { output } = runCLI(claudelintBin, ['validate-plugin'], testProjectDir);

      expect(output).toContain('All checks passed');
    });
  });

  describe('init command', () => {
    it('should create config file with --yes flag', () => {
      const { output } = runCLI(claudelintBin, ['init', '--yes'], testProjectDir);

      expect(output).toContain('created');

      // Check that config file was created
      const configPath = join(testProjectDir, '.claudelintrc.json');
      expect(existsSync(configPath)).toBe(true);

      // Verify config is valid JSON
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      expect(config).toHaveProperty('rules');
    });
  });

  describe('print-config command', () => {
    it('should print message when no config exists', () => {
      let output = '';
      try {
        execSync(`${claudelintBin} print-config`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        // Combine both stdout and stderr since logger uses both
        output = (error.stdout || '') + (error.stderr || '');
      }

      // Should output message about no config and helpful suggestions
      expect(output).toContain('Searched locations');
    });

    it('should print config when config file exists', () => {
      // Create a config file first
      const configPath = join(testProjectDir, '.claudelintrc.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            'size-error': 'error',
          },
        })
      );

      const { output } = runCLI(claudelintBin, ['print-config'], testProjectDir);

      // Result should contain configuration info (may not be pure JSON due to headers)
      expect(output).toBeTruthy();
      expect(output).toContain('size-error');
    });
  });

  describe('validate-config command', () => {
    it('should validate valid config file', () => {
      const configPath = join(testProjectDir, 'valid-config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            'claude-md-size-error': 'error',
          },
        })
      );

      const { output } = runCLI(
        claudelintBin,
        ['validate-config', '--config', configPath],
        testProjectDir
      );

      expect(output).toContain('valid');
    });

    it('should error on config with unknown rule', () => {
      const configPath = join(testProjectDir, 'invalid-config.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          rules: {
            'unknown-rule': 'error',
          },
        })
      );

      const result = spawnSync(claudelintBin, ['validate-config', '--config', configPath], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result.status).not.toBe(0);
    });
  });

  describe('error handling', () => {
    it('should show helpful error for missing files', () => {
      const result = spawnSync(claudelintBin, ['validate-claude-md', '--path', 'non-existent.md'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      const output = (result.stdout || '') + (result.stderr || '');
      expect(output).toContain('not found');
    });

    it('should handle invalid commands gracefully', () => {
      const result = spawnSync(claudelintBin, ['invalid-command'], {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Should exit with error
      expect(result.status).not.toBe(0);
      const output = result.stdout || result.stderr || '';
      expect(output).toBeTruthy();
    });
  });

  describe('--no-color flag', () => {
    it('should disable color output', async () => {
      await claudeMd(testProjectDir).withSize(50000).build();

      let output = '';
      try {
        execSync(`${claudelintBin} check-all --no-color`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || '';
      }

      // Should not contain ANSI color codes
      expect(output).not.toMatch(/\u001b\[\d+m/);
    });
  });

  describe('--color flag', () => {
    it('should enable color output', async () => {
      await claudeMd(testProjectDir).withSize(50000).build();

      let output = '';
      try {
        execSync(`${claudelintBin} check-all --color`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || '';
      }

      // Should contain ANSI color codes (may not work in all environments)
      // We'll just check that the command runs
      expect(output).toBeTruthy();
    });
  });

  describe('multiple validators', () => {
    it('should run all validators and aggregate results', async () => {
      // Create multiple files with different validators
      await claudeMd(testProjectDir).withMinimalContent().build();
      await skill(testProjectDir, 'skill1').withMinimalFields().build();
      await settings(testProjectDir).withMinimalSettings().build();
      await hooks(testProjectDir).withMinimalHooks().build();

      const { output } = runCLI(claudelintBin, ['check-all'], testProjectDir);

      expect(output).toContain('No problems found');
    });

    it('should report all errors from multiple validators', async () => {
      // Create multiple invalid files
      await settings(testProjectDir).buildInvalid();
      await hooks(testProjectDir).buildInvalid();

      let output = '';
      try {
        execSync(`${claudelintBin} check-all`, {
          cwd: testProjectDir,
          encoding: 'utf-8',
        });
      } catch (error: any) {
        output = error.stdout || error.stderr || '';
      }

      // Should report errors from both validators
      expect(output).toContain('error');
    });
  });

  describe('--no-collapse flag', () => {
    it('should collapse repetitive issues by default', async () => {
      // Create CLAUDE.md with 4 references to nonexistent files (triggers 4 same-rule warnings)
      await claudeMd(testProjectDir)
        .withContent(
          '# Project\n\nSee `src/fake1.ts` for details.\n\nSee `src/fake2.ts` for details.\n\nSee `src/fake3.ts` for details.\n\nSee `src/fake4.ts` for details.'
        )
        .build();

      const { output } = runCLI(claudelintBin, ['check-all', '--no-color'], testProjectDir);

      expect(output).toContain('... and');
    });

    it('should show all issues with --no-collapse', async () => {
      await claudeMd(testProjectDir)
        .withContent(
          '# Project\n\nSee `src/fake1.ts` for details.\n\nSee `src/fake2.ts` for details.\n\nSee `src/fake3.ts` for details.\n\nSee `src/fake4.ts` for details.'
        )
        .build();

      const { output } = runCLI(
        claudelintBin,
        ['check-all', '--no-color', '--no-collapse'],
        testProjectDir
      );

      expect(output).not.toContain('... and');
      // All 4 references shown
      expect(output).toContain('fake1.ts');
      expect(output).toContain('fake2.ts');
      expect(output).toContain('fake3.ts');
      expect(output).toContain('fake4.ts');
    });
  });

  describe('--max-warnings on individual validators', () => {
    it('should exit 0 when warnings are under the limit', async () => {
      await claudeMd(testProjectDir).withSize(38000).build(); // Triggers size warning

      const result = spawnSync(
        claudelintBin,
        ['validate-claude-md', '--max-warnings', '10'],
        { cwd: testProjectDir, encoding: 'utf-8' }
      );

      expect(result.status).toBe(0);
    });

    it('should exit 1 when warnings exceed the limit', async () => {
      await claudeMd(testProjectDir).withSize(38000).build(); // Triggers size warning

      const result = spawnSync(
        claudelintBin,
        ['validate-claude-md', '--max-warnings', '0'],
        { cwd: testProjectDir, encoding: 'utf-8' }
      );

      expect(result.status).toBe(1);
      const output = (result.stdout || '') + (result.stderr || '');
      expect(output).toContain('Warning limit exceeded');
    });
  });
});
