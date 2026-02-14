/**
 * Tests for CLI flags
 */

import { spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';

const projectRoot = join(__dirname, '../..');
const claudelintBin = join(projectRoot, 'bin/claudelint');

function runCLI(
  args: string[],
  cwd: string
): { stdout: string; stderr: string; exitCode: number } {
  const result = spawnSync(claudelintBin, args, { cwd, encoding: 'utf-8' });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status ?? 1,
  };
}

describe('CLI flags', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `claudelint-flags-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('--no-config', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--no-config');
    });

    it('skips config file loading on check-all', () => {
      // Create a config file that would cause an error if loaded
      writeFileSync(
        join(testDir, '.claudelintrc.json'),
        JSON.stringify({
          rules: { 'nonexistent-rule-that-should-error': 'error' },
        }),
        'utf-8'
      );

      // Without --no-config, this would fail due to invalid rule
      const result = runCLI(['check-all', '--no-config'], testDir);
      // Should not exit with code 2 (config error)
      expect(result.exitCode).not.toBe(2);
    });
  });

  describe('--output-file', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--output-file');
    });

    it('writes JSON output to file', () => {
      const outputPath = join(testDir, 'report.json');

      // Create minimal project
      mkdirSync(join(testDir, '.claude'), { recursive: true });
      writeFileSync(join(testDir, 'CLAUDE.md'), '# Test\n\nMinimal content.\n', 'utf-8');

      runCLI(
        ['check-all', '--no-config', '--format', 'json', '--output-file', outputPath],
        testDir
      );

      expect(existsSync(outputPath)).toBe(true);
      const content = readFileSync(outputPath, 'utf-8');
      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe('--ignore-pattern', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--ignore-pattern');
    });
  });

  describe('--rule', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--rule');
    });
  });

  describe('--cache-strategy', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--cache-strategy');
    });
  });

  describe('--changed', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--changed');
    });
  });

  describe('--since', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--since');
    });
  });

  describe('--no-ignore', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--no-ignore');
    });
  });

  describe('--stats', () => {
    it('appears in check-all --help', () => {
      const { stdout } = runCLI(['check-all', '--help'], testDir);
      expect(stdout).toContain('--stats');
    });
  });
});
