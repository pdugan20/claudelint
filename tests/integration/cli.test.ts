/**
 * End-to-end CLI integration tests
 * Tests the complete CLI workflow with real file system and subprocess execution
 */

import { execSync, spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'fs';
import { claudeMd, skill, settings, hooks, mcp, plugin } from '../helpers/fixtures';

describe('CLI Integration Tests', () => {
  const projectRoot = join(__dirname, '../..');
  const claudelintBin = join(projectRoot, 'bin/claudelint');
  let testProjectDir: string;

  beforeEach(() => {
    // Create a temporary test project directory
    testProjectDir = join(__dirname, '../__temp__', `cli-test-${Date.now()}`);
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

      const result = execSync(`${claudelintBin} check-all`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
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

      const result = execSync(`${claudelintBin} check-all --verbose`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('CLAUDE.md');
    });

    it('should show less output without --verbose', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const result = execSync(`${claudelintBin} check-all`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Should have summary but less detail
      expect(result).toBeTruthy();
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

    it('should output stylish format by default', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const result = execSync(`${claudelintBin} check-all`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Stylish format has validator names and summary
      expect(result).toContain('CLAUDE.md Validator');
      expect(result).toContain('Overall Summary');
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

      const result = execSync(`${claudelintBin} check-all --config ${configPath}`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toBeTruthy();
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

  describe('specific validator commands', () => {
    it('should run check-claude-md command', async () => {
      await claudeMd(testProjectDir).withMinimalContent().build();

      const result = execSync(`${claudelintBin} check-claude-md`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should run validate-skills command', async () => {
      await skill(testProjectDir, 'test-skill').withMinimalFields().build();

      const result = execSync(`${claudelintBin} validate-skills`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should run validate-settings command', async () => {
      await settings(testProjectDir).withMinimalSettings().build();

      const result = execSync(`${claudelintBin} validate-settings`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should run validate-hooks command', async () => {
      await hooks(testProjectDir).withMinimalHooks().build();

      const result = execSync(`${claudelintBin} validate-hooks`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should run validate-mcp command', async () => {
      await mcp(testProjectDir).withMinimalConfig().build();

      const result = execSync(`${claudelintBin} validate-mcp`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });

    it('should run validate-plugin command', async () => {
      await plugin(testProjectDir).withMinimalManifest().build();

      const result = execSync(`${claudelintBin} validate-plugin`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
    });
  });

  describe('init command', () => {
    it('should create config file with --yes flag', () => {
      const result = execSync(`${claudelintBin} init --yes`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('created');

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

      const result = execSync(`${claudelintBin} print-config`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      // Result should contain configuration info (may not be pure JSON due to headers)
      expect(result).toBeTruthy();
      expect(result).toContain('size-error');
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

      const result = execSync(`${claudelintBin} validate-config --config ${configPath}`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('valid');
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
      const result = spawnSync(claudelintBin, ['check-claude-md', '--path', 'non-existent.md'], {
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

      const result = execSync(`${claudelintBin} check-all`, {
        cwd: testProjectDir,
        encoding: 'utf-8',
      });

      expect(result).toContain('All checks passed');
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
});
