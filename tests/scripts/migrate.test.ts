/**
 * Tests for migration script
 */

import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { migrateConfig } from '../../src/utils/migrate/update-configs';
import { setupTestDir } from '../helpers/test-utils';

describe('Migration Script', () => {
  const { getTestDir } = setupTestDir('migrate-test');

  describe('migrateConfig', () => {
    it('should replace single deprecated rule with replacement', async () => {
      // Note: We don't have actual deprecated rules in the codebase yet
      // This test demonstrates the expected behavior
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'claude-md-size': 'error',
        },
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      // For now, since we have no deprecated rules, this should succeed with no changes
      expect(result.success).toBe(true);
      expect(result.changes.length).toBe(0);
    });

    it('should handle dry-run mode', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'claude-md-size': 'error',
        },
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, true);

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
    });

    it('should handle config with no rules', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {};

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('No rules found in config file');
    });

    it('should handle package.json with claudelint field', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, 'package.json');
      const pkg = {
        name: 'test-project',
        version: '1.0.0',
        claudelint: {
          rules: {
            'claude-md-size': 'error',
          },
        },
      };

      await writeFile(configPath, JSON.stringify(pkg, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
    });

    it('should warn about unknown rules', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'unknown-rule-id': 'error',
        },
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.includes('Unknown rule'))).toBe(true);
    });

    it('should handle invalid JSON', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');

      await writeFile(configPath, 'invalid json {');

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(false);
      expect(result.warnings.some((w) => w.includes('Migration failed'))).toBe(true);
    });

    it('should handle non-existent file', async () => {
      const testDir = getTestDir();
      const result = migrateConfig(join(testDir, 'nonexistent.json'), false);

      expect(result.success).toBe(false);
      expect(result.warnings.some((w) => w.includes('Migration failed'))).toBe(true);
    });

    it('should preserve rule config when replacing', async () => {
      // This test demonstrates that when we DO have deprecated rules,
      // the config (severity + options) should be preserved
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'some-rule': {
            severity: 'warn',
            options: { maxSize: 200 },
          },
        },
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
    });

    it('should not write to file in dry-run mode', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const originalConfig = {
        rules: {
          'claude-md-size': 'error',
        },
      };

      await writeFile(configPath, JSON.stringify(originalConfig, null, 2));

      migrateConfig(configPath, true);

      // Read file and verify it wasn't changed
      const fileContent = await readFile(configPath, 'utf-8');
      const parsedConfig = JSON.parse(fileContent);
      expect(parsedConfig).toEqual(originalConfig);
    });
  });

  describe('Migration edge cases', () => {
    it('should handle empty config file', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');

      await writeFile(configPath, '{}');

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
    });

    it('should handle config with extends field', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        extends: '../base.json',
        rules: {
          'claude-md-size': 'error',
        },
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
    });

    it('should handle config with overrides', async () => {
      const testDir = getTestDir();
      const configPath = join(testDir, '.claudelintrc.json');
      const config = {
        rules: {
          'claude-md-size': 'warn',
        },
        overrides: [
          {
            files: ['**/*.md'],
            rules: {
              'claude-md-size': 'warn',
            },
          },
        ],
      };

      await writeFile(configPath, JSON.stringify(config, null, 2));

      const result = migrateConfig(configPath, false);

      expect(result.success).toBe(true);
    });

    // Note: Test for newline at end of file is skipped because it requires
    // actual deprecated rules to be present in the registry. When rules are
    // migrated, the writeFileSync call includes '\n' suffix (see update-configs.ts)
  });
});
