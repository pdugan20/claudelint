/**
 * Tests for ValidationCache
 *
 * Covers: file change invalidation, stale file cleanup, disabled cache,
 * corrupt cache recovery, cache stats, and backwards compatibility.
 */

import { mkdtempSync, writeFileSync, rmSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ValidationCache } from '../../src/utils/cache';
import { ValidationResult } from '../../src/validators/file-validator';

describe('ValidationCache', () => {
  let tempDir: string;
  let cacheDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claudelint-cache-test-'));
    cacheDir = join(tempDir, '.cache');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  function createCache(options: Record<string, unknown> = {}): ValidationCache {
    return new ValidationCache({
      enabled: true,
      location: cacheDir,
      strategy: 'mtime',
      ...options,
    });
  }

  function createResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
    return {
      errors: [],
      warnings: [],
      valid: true,
      ...overrides,
    };
  }

  function createTrackedFile(name: string, content: string = '# Test'): string {
    const filePath = join(tempDir, name);
    writeFileSync(filePath, content);
    return filePath;
  }

  describe('basic cache operations', () => {
    it('returns null on cache miss', () => {
      const cache = createCache();
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('returns cached result on cache hit', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();
      const result = createResult({ validatedFiles: [filePath] });
      cache.set('validator', result, { rules: {} });

      const { validatedFiles: _vf, ...expectedStored } = result;
      const cached = cache.get('validator', { rules: {} });
      expect(cached).toEqual(expectedStored);
    });

    it('returns null when cache is disabled', () => {
      const cache = createCache({ enabled: false });
      const result = createResult();
      cache.set('validator', result, { rules: {} });

      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('separates entries by validator name', () => {
      const fileA = createTrackedFile('a.md');
      const fileB = createTrackedFile('b.md');
      const cache = createCache();
      const result1 = createResult({ valid: true, validatedFiles: [fileA] });
      const result2 = createResult({ valid: false, errors: [{ message: 'err', severity: 'error' }], validatedFiles: [fileB] });

      cache.set('validator-a', result1, { rules: {} });
      cache.set('validator-b', result2, { rules: {} });

      expect(cache.get('validator-a', { rules: {} })?.valid).toBe(true);
      expect(cache.get('validator-b', { rules: {} })?.valid).toBe(false);
    });

    it('invalidates on config change', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();
      const result = createResult({ validatedFiles: [filePath] });

      cache.set('validator', result, { rules: { 'rule-a': 'error' } });
      const { validatedFiles: _vf, ...expectedStored } = result;
      expect(cache.get('validator', { rules: { 'rule-a': 'error' } })).toEqual(expectedStored);

      // Different config should miss
      expect(cache.get('validator', { rules: { 'rule-a': 'warn' } })).toBeNull();
    });
  });

  describe('file change invalidation', () => {
    it('invalidates when a validated file is modified', async () => {
      const filePath = createTrackedFile('CLAUDE.md', '# Original');
      const cache = createCache();

      const result = createResult({ validatedFiles: [filePath] });
      cache.set('validator', result, { rules: {} });

      // Should hit before modification (validatedFiles is stripped from stored result)
      const { validatedFiles: _vf, ...expectedStored } = result;
      expect(cache.get('validator', { rules: {} })).toEqual(expectedStored);

      // Wait to ensure mtime changes (filesystem precision)
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Modify the file
      writeFileSync(filePath, '# Modified');

      // Should miss after modification
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('invalidates when a validated file is deleted', () => {
      const filePath = createTrackedFile('CLAUDE.md', '# Test');
      const cache = createCache();

      const result = createResult({ validatedFiles: [filePath] });
      cache.set('validator', result, { rules: {} });

      // Should hit before deletion (validatedFiles is stripped from stored result)
      const { validatedFiles: _vf, ...expectedStored } = result;
      expect(cache.get('validator', { rules: {} })).toEqual(expectedStored);

      // Delete the file
      rmSync(filePath);

      // Should miss after deletion
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('does not invalidate when untracked files change', async () => {
      const trackedFile = createTrackedFile('CLAUDE.md', '# Tracked');
      const cache = createCache();

      const result = createResult({ validatedFiles: [trackedFile] });
      cache.set('validator', result, { rules: {} });

      // Wait to ensure mtime changes
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Modify an untracked file
      createTrackedFile('unrelated.txt', 'changed');

      // Should still hit — untracked file doesn't affect cache
      const { validatedFiles: _vf, ...expectedStored } = result;
      expect(cache.get('validator', { rules: {} })).toEqual(expectedStored);
    });

    it('uses error/warning file paths as fallback when validatedFiles is empty', async () => {
      const filePath = createTrackedFile('settings.json', '{}');
      const cache = createCache();

      // Result without validatedFiles but with file refs in warnings
      const result = createResult({
        warnings: [{ message: 'test', severity: 'warning', file: filePath }],
      });
      cache.set('validator', result, { rules: {} });

      // Should hit before modification
      expect(cache.get('validator', { rules: {} })).not.toBeNull();

      // Wait then modify
      await new Promise((resolve) => setTimeout(resolve, 50));
      writeFileSync(filePath, '{ "updated": true }');

      // Should miss after modification
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('invalidates when no files were tracked (detects new files)', () => {
      const cache = createCache();

      // Result with no files (e.g., commands validator found no commands dir)
      const result = createResult();
      cache.set('validator', result, { rules: {} });

      // Should miss — empty fingerprints re-run discovery to detect new files
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });
  });

  describe('stale file cleanup', () => {
    it('removes old result file when overwriting cache entry', () => {
      const cache = createCache();

      // Store first result
      const result1 = createResult();
      cache.set('validator', result1, { rules: { v: 1 } });

      // Get the cache key for the first entry to find the file
      const key1 = cache.getCacheKey('validator', { rules: { v: 1 } });
      const file1 = join(cacheDir, 'files', `${key1}.json`);
      expect(existsSync(file1)).toBe(true);

      // Store second result with different config (different hash)
      const result2 = createResult();
      cache.set('validator', result2, { rules: { v: 2 } });

      // Old file should be cleaned up
      expect(existsSync(file1)).toBe(false);

      // New file should exist
      const key2 = cache.getCacheKey('validator', { rules: { v: 2 } });
      const file2 = join(cacheDir, 'files', `${key2}.json`);
      expect(existsSync(file2)).toBe(true);
    });
  });

  describe('corrupt cache recovery', () => {
    it('handles corrupt index.json gracefully', () => {
      // Write corrupt index
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(join(cacheDir, 'index.json'), '{ invalid json !!!');

      // Should not throw — returns empty cache
      const cache = createCache();
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('handles corrupt result file gracefully', () => {
      const cache = createCache();
      const result = createResult();
      cache.set('validator', result, { rules: {} });

      // Corrupt the result file
      const key = cache.getCacheKey('validator', { rules: {} });
      const resultFile = join(cacheDir, 'files', `${key}.json`);
      writeFileSync(resultFile, '!!! not json');

      // Should return null (cache miss) instead of throwing
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });

    it('handles missing result file gracefully', () => {
      const cache = createCache();
      const result = createResult();
      cache.set('validator', result, { rules: {} });

      // Delete the result file
      const key = cache.getCacheKey('validator', { rules: {} });
      const resultFile = join(cacheDir, 'files', `${key}.json`);
      rmSync(resultFile);

      // Should return null instead of throwing
      expect(cache.get('validator', { rules: {} })).toBeNull();
    });
  });

  describe('cache clear', () => {
    it('removes all cache files and resets index', () => {
      const cache = createCache();
      cache.set('v1', createResult(), { rules: {} });
      cache.set('v2', createResult(), { rules: {} });

      expect(existsSync(cacheDir)).toBe(true);

      cache.clear();

      expect(existsSync(cacheDir)).toBe(false);
    });

    it('does not throw when cache directory does not exist', () => {
      const cache = createCache();
      expect(() => cache.clear()).not.toThrow();
    });
  });

  describe('cache stats', () => {
    it('returns zero stats for empty cache', () => {
      const cache = createCache();
      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.cacheSize).toBe(0);
    });

    it('returns accurate stats after storing results', () => {
      const cache = createCache();
      cache.set('v1', createResult(), { rules: {} });
      cache.set('v2', createResult(), { rules: {} });

      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.cacheSize).toBeGreaterThan(0);
    });
  });

  describe('cache persistence', () => {
    it('persists across cache instances', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache1 = createCache();
      const result = createResult({ validatedFiles: [filePath] });
      cache1.set('validator', result, { rules: {} });

      // Create new instance pointing to same directory
      const cache2 = createCache();
      const { validatedFiles: _vf, ...expectedStored } = result;
      expect(cache2.get('validator', { rules: {} })).toEqual(expectedStored);
    });
  });

  describe('backwards compatibility', () => {
    it('accepts deprecated 3-arg get signature', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();
      const result = createResult({ validatedFiles: [filePath] });
      cache.set('validator', result, [], { rules: {} });

      // Old signature: get(name, files[], config)
      const { validatedFiles: _vf, ...expectedStored } = result;
      const cached = cache.get('validator', [], { rules: {} });
      expect(cached).toEqual(expectedStored);
    });

    it('old set + new get works', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();
      const result = createResult({ validatedFiles: [filePath] });

      // Old signature
      cache.set('validator', result, [], { rules: {} });

      // New signature
      const { validatedFiles: _vf, ...expectedStored } = result;
      const cached = cache.get('validator', { rules: {} });
      expect(cached).toEqual(expectedStored);
    });

    it('new set + old get works', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();
      const result = createResult({ validatedFiles: [filePath] });

      // New signature
      cache.set('validator', result, { rules: {} });

      // Old signature
      const { validatedFiles: _vf, ...expectedStored } = result;
      const cached = cache.get('validator', [], { rules: {} });
      expect(cached).toEqual(expectedStored);
    });
  });

  describe('validatedFiles stripping', () => {
    it('does not store validatedFiles in the cache file', () => {
      const filePath = createTrackedFile('CLAUDE.md');
      const cache = createCache();

      const result = createResult({ validatedFiles: [filePath] });
      cache.set('validator', result, { rules: {} });

      // Read the raw cache file
      const key = cache.getCacheKey('validator', { rules: {} });
      const resultFile = join(cacheDir, 'files', `${key}.json`);
      const stored = JSON.parse(readFileSync(resultFile, 'utf-8'));

      // validatedFiles should not be in the stored JSON
      expect(stored.validatedFiles).toBeUndefined();
    });
  });
});
