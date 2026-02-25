/**
 * Tests for update check utility
 *
 * Overrides HOME to a temp directory so tests use an empty cache
 * instead of the real ~/.claudelint/update-check.json.
 */

import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { checkForUpdate } from '../../src/cli/utils/update-check';

describe('update-check', () => {
  const originalEnv = process.env;
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'claudelint-test-'));
    process.env = { ...originalEnv, HOME: tmpDir };
  });

  afterEach(() => {
    process.env = originalEnv;
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns null when NO_UPDATE_NOTIFIER is set', () => {
    process.env.NO_UPDATE_NOTIFIER = '1';
    const result = checkForUpdate('1.0.0');
    expect(result).toBeNull();
  });

  it('returns null when CI is set', () => {
    process.env.CI = 'true';
    const result = checkForUpdate('1.0.0');
    expect(result).toBeNull();
  });

  it('returns null on first run (no cache)', () => {
    delete process.env.NO_UPDATE_NOTIFIER;
    delete process.env.CI;
    const result = checkForUpdate('0.2.0-beta.1');
    expect(result).toBeNull();
  });

  it('does not throw errors', () => {
    delete process.env.NO_UPDATE_NOTIFIER;
    delete process.env.CI;
    expect(() => checkForUpdate('1.0.0')).not.toThrow();
  });
});
