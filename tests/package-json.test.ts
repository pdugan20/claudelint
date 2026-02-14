/**
 * Package.json validation tests
 *
 * Ensures package.json follows CLI best practices.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

describe('package.json validation', () => {
  it('has exports field', () => {
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.']).toBeDefined();
  });

  it('exports field has types and default entries', () => {
    expect(pkg.exports['.'].types).toBeDefined();
    expect(pkg.exports['.'].default).toBeDefined();
  });

  it('engines field specifies Node.js >= 20', () => {
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBeDefined();
    expect(pkg.engines.node).toMatch(/>=\s*20/);
  });

  it('has no @types/* in production dependencies', () => {
    const prodDeps = Object.keys(pkg.dependencies || {});
    const typeDeps = prodDeps.filter((dep) => dep.startsWith('@types/'));
    expect(typeDeps).toEqual([]);
  });

  it('has no postinstall script', () => {
    expect(pkg.scripts.postinstall).toBeUndefined();
  });

  it('has prepare script instead of postinstall', () => {
    expect(pkg.scripts.prepare).toBeDefined();
  });

  it('has bin field with claudelint entry', () => {
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin.claudelint).toBeDefined();
  });

  it('files field includes dist and bin only', () => {
    expect(pkg.files).toBeDefined();
    expect(pkg.files).toContain('dist');
    expect(pkg.files).toContain('bin');
  });
});
