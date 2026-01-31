/**
 * Validation Cache
 *
 * Caches validation results to speed up repeated validations.
 * Cache is content-based (hash of file content + config + version).
 */

import { createHash } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  readdirSync,
  statSync,
} from 'fs';
import { join } from 'path';
import { ValidationResult } from '../validators/base';

export interface CacheOptions {
  /** Enable caching (default: true) */
  enabled: boolean;
  /** Cache directory location */
  location: string;
  /** Cache strategy: 'content' for content-based, 'mtime' for modification time */
  strategy: 'content' | 'mtime';
}

interface CacheIndex {
  version: string;
  entries: Record<string, CacheEntry>;
}

interface CacheEntry {
  hash: string;
  timestamp: number;
  resultFile: string;
}

export class ValidationCache {
  private options: CacheOptions;
  private index: CacheIndex;
  private indexPath: string;
  private filesDir: string;
  private version: string;

  constructor(options: Partial<CacheOptions> = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      location: options.location || '.claudelint-cache',
      strategy: options.strategy || 'content',
    };

    this.indexPath = join(this.options.location, 'index.json');
    this.filesDir = join(this.options.location, 'files');
    this.version = this.getVersion();

    // Load or create index
    this.index = this.loadIndex();
  }

  /**
   * Get claudelint version from package.json
   */
  private getVersion(): string {
    try {
      // Try to load from package.json
      const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8')) as {
        version?: string;
      };
      return pkg.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  /**
   * Load cache index from disk
   */
  private loadIndex(): CacheIndex {
    if (!this.options.enabled) {
      return { version: this.version, entries: {} };
    }

    if (existsSync(this.indexPath)) {
      try {
        const index = JSON.parse(readFileSync(this.indexPath, 'utf-8')) as CacheIndex;
        // Invalidate if version changed
        if (index.version !== this.version) {
          return { version: this.version, entries: {} };
        }
        return index;
      } catch {
        return { version: this.version, entries: {} };
      }
    }

    return { version: this.version, entries: {} };
  }

  /**
   * Save cache index to disk
   */
  private saveIndex(): void {
    if (!this.options.enabled) {
      return;
    }

    try {
      // Ensure cache directory exists
      if (!existsSync(this.options.location)) {
        mkdirSync(this.options.location, { recursive: true });
      }
      if (!existsSync(this.filesDir)) {
        mkdirSync(this.filesDir, { recursive: true });
      }

      writeFileSync(this.indexPath, JSON.stringify(this.index, null, 2), 'utf-8');
    } catch (error) {
      // Silently fail - caching is optional
      console.warn('Failed to save cache index:', error);
    }
  }

  /**
   * Generate cache key for a validator
   */
  private getCacheKey(validatorName: string, projectFiles: string[], config?: unknown): string {
    const hash = createHash('sha256');

    // Include claudelint version
    hash.update(this.version);

    // Include validator name
    hash.update(validatorName);

    // Include config in hash (critical for cache invalidation when config changes)
    if (config) {
      hash.update(JSON.stringify(config));
    }

    // Include file list and modification times
    for (const file of projectFiles.sort()) {
      hash.update(file);
      if (existsSync(file)) {
        try {
          const stats = statSync(file);
          hash.update(stats.mtime.toISOString());
        } catch {
          // File doesn't exist or can't read stats
        }
      }
    }

    return hash.digest('hex');
  }

  /**
   * Get cached result for a validator
   */
  get(validatorName: string, projectFiles: string[], config?: unknown): ValidationResult | null {
    if (!this.options.enabled) {
      return null;
    }

    const cacheKey = this.getCacheKey(validatorName, projectFiles, config);
    const entry = this.index.entries[validatorName];

    if (!entry || entry.hash !== cacheKey) {
      return null;
    }

    // Load result from cache file
    const resultPath = join(this.filesDir, entry.resultFile);
    if (!existsSync(resultPath)) {
      return null;
    }

    try {
      const cached = JSON.parse(readFileSync(resultPath, 'utf-8')) as ValidationResult;
      return cached;
    } catch {
      return null;
    }
  }

  /**
   * Store validation result in cache
   */
  set(
    validatorName: string,
    result: ValidationResult,
    projectFiles: string[],
    config?: unknown
  ): void {
    if (!this.options.enabled) {
      return;
    }

    try {
      const cacheKey = this.getCacheKey(validatorName, projectFiles, config);
      const resultFileName = `${cacheKey}.json`;
      const resultPath = join(this.filesDir, resultFileName);

      // Ensure directories exist
      if (!existsSync(this.filesDir)) {
        mkdirSync(this.filesDir, { recursive: true });
      }

      // Write result file
      writeFileSync(resultPath, JSON.stringify(result, null, 2), 'utf-8');

      // Update index
      this.index.entries[validatorName] = {
        hash: cacheKey,
        timestamp: Date.now(),
        resultFile: resultFileName,
      };

      this.saveIndex();
    } catch (error) {
      // Silently fail - caching is optional
      console.warn('Failed to cache result:', error);
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    if (existsSync(this.options.location)) {
      try {
        rmSync(this.options.location, { recursive: true, force: true });
        this.index = { version: this.version, entries: {} };
      } catch (error) {
        console.error('Failed to clear cache:', error);
        throw error;
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalEntries: number; cacheSize: number } {
    let totalEntries = 0;
    let cacheSize = 0;

    if (existsSync(this.filesDir)) {
      const files = readdirSync(this.filesDir);
      totalEntries = files.length;

      for (const file of files) {
        try {
          const stats = statSync(join(this.filesDir, file));
          cacheSize += stats.size;
        } catch {
          // Ignore errors
        }
      }
    }

    return { totalEntries, cacheSize };
  }
}
