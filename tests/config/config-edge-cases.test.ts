/**
 * Tests for config edge cases and error handling
 *
 * Covers: malformed JSON, empty config, unknown top-level keys,
 * config precedence, and --no-config behavior
 */

import { findConfigFile, loadConfig } from '../../src/utils/config/types';
import { loadAndValidateConfig } from '../../src/cli/utils/config-loader';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Config edge cases', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `claudelint-config-edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('malformed JSON config', () => {
    it('should throw on invalid JSON syntax', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '{ "rules": { invalid json }');

      expect(() => loadConfig(configPath)).toThrow();
    });

    it('should throw on trailing commas', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '{ "rules": { "claude-md-size": "error", } }');

      expect(() => loadConfig(configPath)).toThrow();
    });

    it('should throw on completely empty file', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '');

      expect(() => loadConfig(configPath)).toThrow();
    });
  });

  describe('empty config object', () => {
    it('should load empty object config without errors', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, '{}');

      const config = loadConfig(configPath);
      expect(config).toEqual({});
    });

    it('should load config with empty rules object', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(configPath, JSON.stringify({ rules: {} }));

      const config = loadConfig(configPath);
      expect(config).toEqual({ rules: {} });
    });
  });

  describe('unknown top-level keys', () => {
    it('should load config with unknown keys without crashing', () => {
      const configPath = join(testDir, '.claudelintrc.json');
      writeFileSync(
        configPath,
        JSON.stringify({
          ruls: { 'claude-md-size': 'error' },
          unknownField: true,
          rules: { 'claude-md-size': 'warn' },
        })
      );

      const config = loadConfig(configPath);
      // The unknown keys are loaded but ignored by the resolver
      expect(config.rules).toEqual({ 'claude-md-size': 'warn' });
    });
  });

  describe('config file precedence', () => {
    it('should prefer .claudelintrc.json over package.json in same directory', () => {
      // Create both config sources
      const rcPath = join(testDir, '.claudelintrc.json');
      writeFileSync(
        rcPath,
        JSON.stringify({
          rules: { 'claude-md-size': 'warn' },
        })
      );

      const pkgPath = join(testDir, 'package.json');
      writeFileSync(
        pkgPath,
        JSON.stringify({
          name: 'test-pkg',
          claudelint: {
            rules: { 'claude-md-size': 'error' },
          },
        })
      );

      const found = findConfigFile(testDir);
      expect(found).toBe(rcPath);

      const config = loadConfig(found!);
      expect(config.rules!['claude-md-size']).toBe('warn');
    });

    it('should find package.json when no .claudelintrc.json exists', () => {
      const pkgPath = join(testDir, 'package.json');
      writeFileSync(
        pkgPath,
        JSON.stringify({
          name: 'test-pkg',
          claudelint: {
            rules: { 'claude-md-size': 'error' },
          },
        })
      );

      const found = findConfigFile(testDir);
      expect(found).toBe(pkgPath);
    });

    it('should skip package.json without claudelint field', () => {
      const pkgPath = join(testDir, 'package.json');
      writeFileSync(
        pkgPath,
        JSON.stringify({
          name: 'test-pkg',
          version: '1.0.0',
        })
      );

      const found = findConfigFile(testDir);
      expect(found).toBeNull();
    });

    it('should walk up to parent for .claudelintrc.json', () => {
      const childDir = join(testDir, 'packages', 'child');
      mkdirSync(childDir, { recursive: true });

      // Config in parent
      const rcPath = join(testDir, '.claudelintrc.json');
      writeFileSync(rcPath, JSON.stringify({ rules: {} }));

      // package.json without claudelint in child
      const pkgPath = join(childDir, 'package.json');
      writeFileSync(pkgPath, JSON.stringify({ name: 'child' }));

      const found = findConfigFile(childDir);
      expect(found).toBe(rcPath);
    });
  });

  describe('--no-config flag', () => {
    it('should return empty config when config is false', () => {
      const config = loadAndValidateConfig({ config: false });
      expect(config).toEqual({});
    });

    it('should return empty config with verbose when config is false', () => {
      const config = loadAndValidateConfig({ config: false, verbose: true });
      expect(config).toEqual({});
    });
  });

  describe('unsupported config formats', () => {
    it('should throw for unsupported file extensions', () => {
      const configPath = join(testDir, 'config.toml');
      writeFileSync(configPath, 'key = "value"');

      expect(() => loadConfig(configPath)).toThrow(/Unsupported config file format/);
    });
  });
});
