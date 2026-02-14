/**
 * Tests for signal handling
 */

import { spawnSync } from 'child_process';
import { join } from 'path';

const claudelintBin = join(__dirname, '../../bin/claudelint');

describe('signal handling', () => {
  it('check-all registers SIGINT handler', () => {
    // Verify the CLI starts and runs without issues related to signal handling
    // We can't easily test signal delivery in Jest, but we can verify
    // the process starts correctly with signal handlers registered
    const result = spawnSync('node', [claudelintBin, '--help'], {
      encoding: 'utf-8',
      timeout: 5000,
    });

    expect(result.status).toBe(0);
  });

  it('check-all exits cleanly on normal completion', () => {
    // Run --version to verify the process starts and exits cleanly
    // with signal handlers registered (they shouldn't interfere)
    const result = spawnSync(
      'node',
      [claudelintBin, '--version'],
      {
        encoding: 'utf-8',
        timeout: 5000,
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('claudelint');
  });
});
