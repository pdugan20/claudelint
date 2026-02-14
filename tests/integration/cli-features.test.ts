/**
 * Cross-cutting CLI integration tests for features added in Phases 1-7
 */

import { spawnSync } from 'child_process';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';

const claudelintBin = join(__dirname, '../../bin/claudelint');

describe('CLI features integration', () => {
  describe('default command', () => {
    it('runs check-all when invoked with no args', () => {
      const result = spawnSync('node', [claudelintBin], {
        encoding: 'utf-8',
        timeout: 10000,
        cwd: join(__dirname, '../..'), // project root
      });

      // Should produce output (either success or issue list)
      const output = result.stdout + result.stderr;
      expect(output).toBeTruthy();
      // Exit code should be 0 or 1 (not 2 which is a usage error)
      expect([0, 1]).toContain(result.status);
    });
  });

  describe('--version', () => {
    it('includes tool name in version output', () => {
      const result = spawnSync('node', [claudelintBin, '--version'], {
        encoding: 'utf-8',
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('claudelint');
      expect(result.stdout).toMatch(/v\d+\.\d+/);
    });
  });

  describe('init --yes', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = join(
        tmpdir(),
        `claudelint-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
      );
      mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates config in temp directory', () => {
      const result = spawnSync('node', [claudelintBin, 'init', '--yes'], {
        encoding: 'utf-8',
        cwd: tempDir,
        timeout: 10000,
      });

      const output = result.stdout + result.stderr;
      expect(output.toLowerCase()).toContain('created');
      expect(existsSync(join(tempDir, '.claudelintrc.json'))).toBe(true);

      // Verify config uses preset extends
      const config = JSON.parse(readFileSync(join(tempDir, '.claudelintrc.json'), 'utf-8'));
      expect(config.extends).toBe('claudelint:recommended');
    });
  });

  describe('--help', () => {
    it('contains examples section', () => {
      const result = spawnSync('node', [claudelintBin, '--help'], {
        encoding: 'utf-8',
      });

      expect(result.stdout).toContain('Examples:');
    });

    it('contains documentation link', () => {
      const result = spawnSync('node', [claudelintBin, '--help'], {
        encoding: 'utf-8',
      });

      expect(result.stdout).toContain('https://claudelint.com');
    });
  });

  describe('JSON output', () => {
    it('--format json output contains no ANSI codes', () => {
      const result = spawnSync(
        'node',
        [claudelintBin, '--format', 'json', '--no-config'],
        {
          encoding: 'utf-8',
          timeout: 10000,
          cwd: join(__dirname, '../..'),
        }
      );

      // Check stdout for ANSI escape sequences
      const ansiRegex = /\x1B\[[0-9;]*[a-zA-Z]/;
      if (result.stdout.trim()) {
        expect(result.stdout).not.toMatch(ansiRegex);
      }
    });
  });
});
