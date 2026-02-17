/**
 * API Surface Snapshot Test
 *
 * Captures the public API surface of claude-code-lint. If an export is added,
 * removed, or renamed in src/index.ts, this test will fail. Run
 * `npx jest --updateSnapshot` to accept intentional API surface changes.
 */

import * as api from '../../src/index';

describe('Public API surface', () => {
  it('exports have not changed unexpectedly', () => {
    const exportNames = Object.keys(api).sort();
    expect(exportNames).toMatchSnapshot();
  });

  it('exports the expected value types', () => {
    // Classes
    expect(typeof api.ClaudeLint).toBe('function');
    expect(typeof api.BaseFormatter).toBe('function');

    // Functions
    expect(typeof api.lint).toBe('function');
    expect(typeof api.lintText).toBe('function');
    expect(typeof api.formatResults).toBe('function');
    expect(typeof api.resolveConfig).toBe('function');
    expect(typeof api.getFileInfo).toBe('function');
    expect(typeof api.loadFormatter).toBe('function');
    expect(typeof api.isBuiltinFormatter).toBe('function');
    expect(typeof api.findConfigFile).toBe('function');
    expect(typeof api.loadConfig).toBe('function');

    // Constants
    expect(Array.isArray(api.BUILTIN_FORMATTERS)).toBe(true);
    expect(api.BUILTIN_FORMATTERS).toContain('stylish');
    expect(api.BUILTIN_FORMATTERS).toContain('json');
    expect(api.BUILTIN_FORMATTERS).toContain('compact');
    expect(api.BUILTIN_FORMATTERS).toContain('sarif');
    expect(api.BUILTIN_FORMATTERS).toContain('github');
  });
});
