/**
 * Tests for cache invalidation with config inheritance
 */

import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ValidationCache } from '../../src/utils/cache';
import { ValidationResult } from '../../src/validators/file-validator';
import { loadConfigWithExtends } from '../../src/utils/config/extends';

describe('ValidationCache with extends', () => {
  let tempDir: string;
  let cache: ValidationCache;
  let cacheDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-cache-test-'));
    cacheDir = join(tempDir, '.cache');
    cache = new ValidationCache({
      enabled: true,
      location: cacheDir,
      strategy: 'mtime',
    });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createMockResult(): ValidationResult {
    return {
      errors: [],
      warnings: [],
      valid: true,
    };
  }

  describe('config inheritance cache invalidation', () => {
    it('invalidates cache when root config changes', () => {
      // Create root config
      const rootConfigPath = join(tempDir, 'root.json');
      writeFileSync(
        rootConfigPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      // Create child config that extends root
      const childConfigPath = join(tempDir, 'child.json');
      writeFileSync(
        childConfigPath,
        JSON.stringify({
          extends: './root.json',
        })
      );

      // Load merged config (root + child)
      const config1 = loadConfigWithExtends(childConfigPath);

      // Store result in cache with merged config
      const result1 = createMockResult();
      cache.set('test-validator', result1, [], config1);

      // Verify cache hit
      const cached1 = cache.get('test-validator', [], config1);
      expect(cached1).toEqual(result1);

      // Modify root config
      writeFileSync(
        rootConfigPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'warn', // Changed from 'error'
          },
        })
      );

      // Load new merged config
      const config2 = loadConfigWithExtends(childConfigPath);

      // Cache should miss because merged config changed
      const cached2 = cache.get('test-validator', [], config2);
      expect(cached2).toBeNull();
    });

    it('invalidates cache when child config changes', () => {
      // Create root config
      const rootConfigPath = join(tempDir, 'root.json');
      writeFileSync(
        rootConfigPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      // Create child config that extends root
      const childConfigPath = join(tempDir, 'child.json');
      writeFileSync(
        childConfigPath,
        JSON.stringify({
          extends: './root.json',
        })
      );

      // Load merged config
      const config1 = loadConfigWithExtends(childConfigPath);

      // Store in cache
      const result1 = createMockResult();
      cache.set('test-validator', result1, [], config1);

      // Verify cache hit
      expect(cache.get('test-validator', [], config1)).toEqual(result1);

      // Modify child config
      writeFileSync(
        childConfigPath,
        JSON.stringify({
          extends: './root.json',
          rules: {
            'claude-md-size': 'warn', // Added new rule
          },
        })
      );

      // Load new merged config
      const config2 = loadConfigWithExtends(childConfigPath);

      // Cache should miss
      expect(cache.get('test-validator', [], config2)).toBeNull();
    });

    it('invalidates cache when extended config in chain changes', () => {
      // Create grandparent config
      const grandparentPath = join(tempDir, 'grandparent.json');
      writeFileSync(
        grandparentPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      // Create parent config that extends grandparent
      const parentPath = join(tempDir, 'parent.json');
      writeFileSync(
        parentPath,
        JSON.stringify({
          extends: './grandparent.json',
        })
      );

      // Create child config that extends parent
      const childPath = join(tempDir, 'child.json');
      writeFileSync(
        childPath,
        JSON.stringify({
          extends: './parent.json',
        })
      );

      // Load merged config (grandparent → parent → child)
      const config1 = loadConfigWithExtends(childPath);

      // Store in cache
      const result1 = createMockResult();
      cache.set('test-validator', result1, [], config1);

      // Verify cache hit
      expect(cache.get('test-validator', [], config1)).toEqual(result1);

      // Modify grandparent (deep in chain)
      writeFileSync(
        grandparentPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'warn', // Changed
          },
        })
      );

      // Load new merged config
      const config2 = loadConfigWithExtends(childPath);

      // Cache should miss because grandparent changed
      expect(cache.get('test-validator', [], config2)).toBeNull();
    });

    it('cache hits when no configs change', () => {
      // Create configs
      const rootPath = join(tempDir, 'root.json');
      writeFileSync(
        rootPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      const childPath = join(tempDir, 'child.json');
      writeFileSync(
        childPath,
        JSON.stringify({
          extends: './root.json',
        })
      );

      // Load merged config
      const config1 = loadConfigWithExtends(childPath);

      // Store in cache
      const result1 = createMockResult();
      result1.errors.push({
        ruleId: 'claude-md-size',
        message: 'Test error',
        severity: 'error',
        file: '/test',
        line: 1,
      });
      result1.valid = false;
      cache.set('test-validator', result1, [], config1);

      // Load same config again (no changes)
      const config2 = loadConfigWithExtends(childPath);

      // Cache should hit
      const cached = cache.get('test-validator', [], config2);
      expect(cached).toEqual(result1);
      expect(cached?.errors).toHaveLength(1);
    });

    it('cache hits when unrelated file changes', () => {
      // Create configs
      const rootPath = join(tempDir, 'root.json');
      writeFileSync(
        rootPath,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      const childPath = join(tempDir, 'child.json');
      writeFileSync(
        childPath,
        JSON.stringify({
          extends: './root.json',
        })
      );

      // Load merged config
      const config1 = loadConfigWithExtends(childPath);

      // Store in cache
      const result1 = createMockResult();
      cache.set('test-validator', result1, [], config1);

      // Modify an unrelated file
      const unrelatedPath = join(tempDir, 'unrelated.md');
      writeFileSync(unrelatedPath, '# Test');

      // Load same config
      const config2 = loadConfigWithExtends(childPath);

      // Cache should still hit (unrelated file doesn't affect config)
      expect(cache.get('test-validator', [], config2)).toEqual(result1);
    });
  });

  describe('config cache key includes merged config', () => {
    it('same validator with different configs invalidates cache', () => {
      // Create two configs
      const config1Path = join(tempDir, 'config1.json');
      writeFileSync(
        config1Path,
        JSON.stringify({
          rules: {
            'claude-md-size': 'error',
          },
        })
      );

      const config2Path = join(tempDir, 'config2.json');
      writeFileSync(
        config2Path,
        JSON.stringify({
          rules: {
            'claude-md-size': 'warn', // Different severity
          },
        })
      );

      // Load config1
      const config1 = loadConfigWithExtends(config1Path);

      // Store result with config1
      const result1 = createMockResult();
      result1.errors.push({ ruleId: 'claude-md-size', message: 'Error 1', severity: 'error', file: '/test', line: 1 });
      result1.valid = false;
      cache.set('validator1', result1, [], config1);

      // Get with config1 should hit cache
      const cached1 = cache.get('validator1', [], config1);
      expect(cached1).toEqual(result1);

      // Load config2 (different rules)
      const config2 = loadConfigWithExtends(config2Path);

      // Get with config2 should miss cache (different config)
      const cached2 = cache.get('validator1', [], config2);
      expect(cached2).toBeNull();
    });
  });
});
