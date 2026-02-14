/**
 * Tests for config inheritance (extends) functionality
 */

import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { resolveConfigPath, loadConfigWithExtends } from '../../src/utils/config/extends';
import { ClaudeLintConfig } from '../../src/utils/config/types';
import { ConfigError } from '../../src/utils/config/resolver';

describe('resolveConfigPath', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('relative paths', () => {
    it('resolves ./ prefix', () => {
      const configPath = join(tempDir, 'base.json');
      writeFileSync(configPath, '{}');

      const resolved = resolveConfigPath('./base.json', tempDir);
      expect(resolved).toBe(configPath);
    });

    it('resolves ../ prefix', () => {
      const parentDir = tempDir;
      const childDir = join(tempDir, 'child');
      const configPath = join(parentDir, 'root.json');

      writeFileSync(configPath, '{}');

      const resolved = resolveConfigPath('../root.json', childDir);
      expect(resolved).toBe(configPath);
    });

    it('throws when file does not exist', () => {
      expect(() => {
        resolveConfigPath('./missing.json', tempDir);
      }).toThrow(ConfigError);

      expect(() => {
        resolveConfigPath('./missing.json', tempDir);
      }).toThrow(/not found/);
    });

    it('includes resolved path in error', () => {
      expect(() => {
        resolveConfigPath('./missing.json', tempDir);
      }).toThrow(/Resolved to:.*missing\.json/);
    });

    it('includes referenced directory in error', () => {
      expect(() => {
        resolveConfigPath('./missing.json', tempDir);
      }).toThrow(new RegExp(`Referenced from:.*${tempDir}`));
    });
  });

  describe('built-in presets', () => {
    it('resolves claudelint:recommended to file path', () => {
      const resolved = resolveConfigPath('claudelint:recommended', tempDir);
      expect(resolved).toMatch(/presets\/recommended\.json$/);
    });

    it('resolves claudelint:all to file path', () => {
      const resolved = resolveConfigPath('claudelint:all', tempDir);
      expect(resolved).toMatch(/presets\/all\.json$/);
    });

    it('throws ConfigError for unknown claudelint: preset', () => {
      expect(() => {
        resolveConfigPath('claudelint:unknown', tempDir);
      }).toThrow(ConfigError);

      expect(() => {
        resolveConfigPath('claudelint:unknown', tempDir);
      }).toThrow(/Unknown built-in preset/);
    });

    it('lists available presets in error message', () => {
      expect(() => {
        resolveConfigPath('claudelint:nonexistent', tempDir);
      }).toThrow(/claudelint:recommended/);
    });
  });

  describe('node_modules packages', () => {
    it('throws when package not installed', () => {
      expect(() => {
        resolveConfigPath('nonexistent-package', tempDir);
      }).toThrow(ConfigError);

      expect(() => {
        resolveConfigPath('nonexistent-package', tempDir);
      }).toThrow(/not found/);
    });

    it('suggests npm install for missing packages', () => {
      expect(() => {
        resolveConfigPath('missing-pkg', tempDir);
      }).toThrow(/npm install --save-dev missing-pkg/);
    });
  });
});

describe('loadConfigWithExtends', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createConfig(name: string, config: ClaudeLintConfig): string {
    const path = join(tempDir, name);
    writeFileSync(path, JSON.stringify(config, null, 2));
    return path;
  }

  describe('single extends', () => {
    it('loads and merges extended config', () => {
      createConfig('base.json', {
        rules: {
          'size-error': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        rules: {
          'size-warning': 'warn',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.rules).toMatchObject({
        'size-error': 'error', // From base
        'size-warning': 'warn', // From child
      });
    });

    it('child overrides base rules', () => {
      createConfig('base.json', {
        rules: {
          'size-warning': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        rules: {
          'size-warning': 'off',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.rules!['size-warning']).toBe('off');
    });

    it('returns as-is when no extends', () => {
      const path = createConfig('no-extends.json', {
        rules: {
          'size-error': 'error',
        },
      });

      const config = loadConfigWithExtends(path);

      expect(config).toMatchObject({
        rules: {
          'size-error': 'error',
        },
      });
      expect(config.extends).toBeUndefined();
    });
  });

  describe('multiple extends', () => {
    it('merges array of extends in order', () => {
      createConfig('base.json', {
        rules: {
          'size-error': 'warn',
        },
      });

      createConfig('strict.json', {
        rules: {
          'size-error': 'error',
          'skill-missing-changelog': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: ['./base.json', './strict.json'],
        rules: {
          'size-warning': 'warn',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.rules).toMatchObject({
        'size-error': 'error', // From strict (overrides base)
        'skill-missing-changelog': 'error', // From strict
        'size-warning': 'warn', // From child
      });
    });

    it('child overrides all extended configs', () => {
      createConfig('base.json', {
        rules: {
          'size-error': 'warn',
        },
      });

      createConfig('strict.json', {
        rules: {
          'size-error': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: ['./base.json', './strict.json'],
        rules: {
          'size-error': 'off',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.rules!['size-error']).toBe('off');
    });
  });

  describe('recursive extends', () => {
    it('loads multi-level extends (A → B → C)', () => {
      createConfig('root.json', {
        rules: {
          'size-error': 'error',
        },
      });

      createConfig('base.json', {
        extends: './root.json',
        rules: {
          'size-warning': 'warn',
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        rules: {
          'skill-missing-changelog': 'error',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.rules).toMatchObject({
        'size-error': 'error', // From root
        'size-warning': 'warn', // From base
        'skill-missing-changelog': 'error', // From child
      });
    });

    it('merge order is correct (root → base → child)', () => {
      createConfig('root.json', {
        rules: {
          'size-error': 'warn',
        },
      });

      createConfig('base.json', {
        extends: './root.json',
        rules: {
          'size-error': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        rules: {
          'size-error': 'off',
        },
      });

      const config = loadConfigWithExtends(childPath);

      // Child should win (last in chain)
      expect(config.rules!['size-error']).toBe('off');
    });
  });

  describe('circular dependencies', () => {
    it('detects direct circular dependency (A → B → A)', () => {
      createConfig('a.json', {
        extends: './b.json',
      });

      createConfig('b.json', {
        extends: './a.json',
      });

      const aPath = join(tempDir, 'a.json');

      expect(() => {
        loadConfigWithExtends(aPath);
      }).toThrow(ConfigError);

      expect(() => {
        loadConfigWithExtends(aPath);
      }).toThrow(/Circular dependency/);
    });

    it('includes dependency chain in error', () => {
      createConfig('a.json', {
        extends: './b.json',
      });

      createConfig('b.json', {
        extends: './a.json',
      });

      const aPath = join(tempDir, 'a.json');

      expect(() => {
        loadConfigWithExtends(aPath);
      }).toThrow(/a\.json/);

      expect(() => {
        loadConfigWithExtends(aPath);
      }).toThrow(/b\.json/);
    });
  });

  describe('config merging', () => {
    it('deep merges rules object', () => {
      createConfig('base.json', {
        rules: {
          'size-error': 'error',
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        rules: {
          'size-warning': 'warn',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(Object.keys(config.rules || {})).toContain('size-error');
      expect(Object.keys(config.rules || {})).toContain('size-warning');
    });

    it('concatenates overrides arrays', () => {
      createConfig('base.json', {
        overrides: [
          {
            files: ['*.md'],
            rules: { 'size-error': 'off' },
          },
        ],
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        overrides: [
          {
            files: ['SKILL.md'],
            rules: { 'skill-missing-version': 'off' },
          },
        ],
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.overrides).toHaveLength(2);
      expect(config.overrides![0].files).toContain('*.md');
      expect(config.overrides![1].files).toContain('SKILL.md');
    });

    it('concatenates and dedupes ignorePatterns', () => {
      createConfig('base.json', {
        ignorePatterns: ['node_modules/**', 'dist/**'],
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        ignorePatterns: ['dist/**', 'coverage/**'],
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.ignorePatterns).toContain('node_modules/**');
      expect(config.ignorePatterns).toContain('dist/**');
      expect(config.ignorePatterns).toContain('coverage/**');

      // Should be deduplicated
      const distCount = config.ignorePatterns!.filter(p => p === 'dist/**').length;
      expect(distCount).toBe(1);
    });

    it('last wins for output object', () => {
      createConfig('base.json', {
        output: {
          format: 'stylish',
          verbose: false,
        },
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        output: {
          format: 'json',
        },
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.output?.format).toBe('json');
      expect(config.output?.verbose).toBe(false); // Merged from base
    });

    it('last wins for scalar values', () => {
      createConfig('base.json', {
        maxWarnings: 10,
        reportUnusedDisableDirectives: false,
      });

      const childPath = createConfig('child.json', {
        extends: './base.json',
        maxWarnings: 5,
        reportUnusedDisableDirectives: true,
      });

      const config = loadConfigWithExtends(childPath);

      expect(config.maxWarnings).toBe(5);
      expect(config.reportUnusedDisableDirectives).toBe(true);
    });
  });

  describe('error handling', () => {
    it('provides helpful error for missing extended config', () => {
      const childPath = createConfig('child.json', {
        extends: './nonexistent.json',
      });

      expect(() => {
        loadConfigWithExtends(childPath);
      }).toThrow(/Extended config not found/);

      expect(() => {
        loadConfigWithExtends(childPath);
      }).toThrow(/nonexistent\.json/);
    });
  });
});
