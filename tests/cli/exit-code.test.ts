/**
 * Tests for the shared exit-code policy
 */

import { resolveExitCode } from '../../src/cli/utils/exit-code';

describe('resolveExitCode', () => {
  it('succeeds on a clean run', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 0 })).toBe(0);
  });

  it('fails on errors', () => {
    expect(resolveExitCode({ totalErrors: 1, totalWarnings: 0 })).toBe(1);
  });

  it('tolerates warnings by default', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 3 })).toBe(0);
  });

  it('fails on warnings under strict', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 1, strict: true })).toBe(1);
  });

  it('succeeds under strict with no problems', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 0, strict: true })).toBe(0);
  });

  it('fails on warnings with warningsAsErrors', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 1, warningsAsErrors: true })).toBe(1);
  });

  it('fails when the warning budget is exceeded', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 1, maxWarnings: 0 })).toBe(1);
  });

  it('succeeds when warnings are within budget', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 2, maxWarnings: 2 })).toBe(0);
  });

  it('treats a negative budget as unlimited', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 99, maxWarnings: -1 })).toBe(0);
  });

  it('fails when deprecated rules were used', () => {
    expect(resolveExitCode({ totalErrors: 0, totalWarnings: 0, hasDeprecatedRules: true })).toBe(1);
  });
});
