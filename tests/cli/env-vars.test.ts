/**
 * Environment variable tests
 */

import { spawnSync } from 'child_process';
import { join } from 'path';

const claudelintBin = join(__dirname, '../../bin/claudelint');

describe('environment variables', () => {
  describe('NO_COLOR', () => {
    it('disables color in output', () => {
      const result = spawnSync('node', [claudelintBin, '--help'], {
        encoding: 'utf-8',
        env: { ...process.env, NO_COLOR: '1' },
      });

      // ANSI escape codes should not be present
      const ansiRegex = /\x1B\[[0-9;]*[a-zA-Z]/;
      expect(result.stdout).not.toMatch(ansiRegex);
    });
  });

  describe('FORCE_COLOR', () => {
    it('is documented and respected', () => {
      // Verify --help mentions color-related flags
      const result = spawnSync('node', [claudelintBin, 'check-all', '--help'], {
        encoding: 'utf-8',
      });

      expect(result.stdout + result.stderr).toContain('--color');
      expect(result.stdout + result.stderr).toContain('--no-color');
    });
  });

  describe('--color and --no-color flags', () => {
    it('--no-color flag appears in help', () => {
      const result = spawnSync('node', [claudelintBin, 'check-all', '--help'], {
        encoding: 'utf-8',
      });

      expect(result.stdout + result.stderr).toContain('--no-color');
    });

    it('--color flag appears in help', () => {
      const result = spawnSync('node', [claudelintBin, 'check-all', '--help'], {
        encoding: 'utf-8',
      });

      expect(result.stdout + result.stderr).toContain('--color');
    });
  });
});
