/**
 * Integration tests for preset loading via config extends
 *
 * Verifies that configs using "extends": "claudelint:recommended"
 * load and merge correctly through the full config pipeline.
 */

import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadConfigWithExtends } from '../../src/utils/config/extends';

describe('preset integration', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-preset-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createConfig(name: string, config: Record<string, unknown>): string {
    const path = join(tempDir, name);
    writeFileSync(path, JSON.stringify(config, null, 2));
    return path;
  }

  describe('extends claudelint:recommended', () => {
    it('loads recommended preset rules', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:recommended',
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.rules).toBeDefined();
      expect(Object.keys(config.rules!).length).toBeGreaterThan(0);
    });

    it('merges user overrides on top of preset', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:recommended',
        rules: {
          'claude-md-size': 'off',
        },
      });

      const config = loadConfigWithExtends(configPath);

      // User override should win
      expect(config.rules!['claude-md-size']).toBe('off');
    });

    it('allows adding rules not in recommended', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:recommended',
        rules: {
          'settings-permission-empty-pattern': 'error',
        },
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.rules!['settings-permission-empty-pattern']).toBe('error');
    });
  });

  describe('extends claudelint:all', () => {
    it('loads all rules', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:all',
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.rules).toBeDefined();
      // all.json should have more rules than recommended
      expect(Object.keys(config.rules!).length).toBeGreaterThanOrEqual(100);
    });

    it('allows turning off specific rules', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:all',
        rules: {
          'skill-missing-changelog': 'off',
        },
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.rules!['skill-missing-changelog']).toBe('off');
    });
  });

  describe('preset with other config fields', () => {
    it('merges ignorePatterns from user config', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:recommended',
        ignorePatterns: ['coverage/**'],
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.ignorePatterns).toContain('coverage/**');
    });

    it('merges output settings from user config', () => {
      const configPath = createConfig('.claudelintrc.json', {
        extends: 'claudelint:recommended',
        output: {
          format: 'json',
        },
      });

      const config = loadConfigWithExtends(configPath);

      expect(config.output?.format).toBe('json');
    });
  });

  describe('preset combined with relative extends', () => {
    it('can extend preset and local config together', () => {
      createConfig('team.json', {
        rules: {
          'skill-dangerous-command': 'error',
        },
      });

      const configPath = createConfig('.claudelintrc.json', {
        extends: ['claudelint:recommended', './team.json'],
        rules: {
          'claude-md-size': 'off',
        },
      });

      const config = loadConfigWithExtends(configPath);

      // Has recommended rules
      expect(Object.keys(config.rules!).length).toBeGreaterThan(1);
      // Has team override
      expect(config.rules!['skill-dangerous-command']).toBe('error');
      // Has user override
      expect(config.rules!['claude-md-size']).toBe('off');
    });
  });
});
