import { findConfigFile, loadConfig, mergeConfig, normalizeRuleConfig } from '../../src/utils/config';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { setupTestDir } from '../helpers/test-utils';

describe('Configuration utilities', () => {
  const { getTestDir } = setupTestDir();

  describe('findConfigFile', () => {
    it('should find .claudelintrc.json', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      await writeFile(configPath, JSON.stringify({ rules: {} }));

      const found = findConfigFile(testDir);
      expect(found).toBe(configPath);
    });

    it('should find config in parent directory', async () => {
      const testDir = getTestDir();
      const subDir = join(testDir, 'subdir');
      await mkdir(subDir);

      const configPath = join(testDir, '.claudelintrc.json');
      await writeFile(configPath, JSON.stringify({ rules: {} }));

      const found = findConfigFile(subDir);
      expect(found).toBe(configPath);
    });

    it('should return null if no config found', () => {
      const testDir = getTestDir();
      const found = findConfigFile(testDir);
      expect(found).toBeNull();
    });

    it('should find claudelint config in package.json', async () => {
      const testDir = getTestDir();
      const pkgPath = join(testDir, 'package.json');
      await writeFile(
        pkgPath,
        JSON.stringify({
          name: 'test',
          claudelint: {
            rules: {
              'size-warning': 'off',
            },
          },
        })
      );

      const found = findConfigFile(testDir);
      expect(found).toBe(pkgPath);
    });
  });

  describe('loadConfig', () => {
    it('should load JSON config', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'size-warning': 'off',
          'missing-changelog': 'warn',
        },
      };
      await writeFile(configPath, JSON.stringify(config));

      const loaded = loadConfig(configPath);
      expect(loaded).toEqual(config);
    });

    it('should load config from package.json', async () => {
      const testDir = getTestDir();
      const pkgPath = join(testDir, 'package.json');
      const config = {
        rules: {
          'size-warning': 'off',
        },
      };
      await writeFile(
        pkgPath,
        JSON.stringify({
          name: 'test',
          claudelint: config,
        })
      );

      const loaded = loadConfig(pkgPath);
      expect(loaded).toEqual(config);
    });
  });

  describe('mergeConfig', () => {
    it('should merge user config with defaults', () => {
      const userConfig = {
        rules: {
          'size-warning': 'off' as const,
        },
      };

      const defaults = {
        rules: {
          'size-warning': 'warn' as const,
          'missing-changelog': 'warn' as const,
        },
        output: {
          verbose: false,
        },
      };

      const merged = mergeConfig(userConfig, defaults);

      expect(merged.rules).toEqual({
        'size-warning': 'off',
        'missing-changelog': 'warn',
      });
    });
  });

  describe('normalizeRuleConfig', () => {
    it('should normalize string to RuleConfig', () => {
      const normalized = normalizeRuleConfig('warn');
      expect(normalized).toEqual({ severity: 'warn' });
    });

    it('should pass through RuleConfig object', () => {
      const config = { severity: 'error' as const, options: { max: 100 } };
      const normalized = normalizeRuleConfig(config);
      expect(normalized).toEqual(config);
    });
  });
});
