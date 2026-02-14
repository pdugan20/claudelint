/**
 * Tests for update check utility
 */

import { checkForUpdate } from '../../src/cli/utils/update-check';

describe('update-check', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
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
    // First run triggers background check and returns null
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
