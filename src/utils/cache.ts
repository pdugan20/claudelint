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
import { ValidationResult } from '../validators/file-validator';
import { DiagnosticCollector } from './diagnostics';

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

  constructor(
    options: Partial<CacheOptions> = {},
    private diagnostics?: DiagnosticCollector
  ) {
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
   * Get claudelint version from package.json, including build fingerprint
   * so that any rebuild invalidates the cache (e.g., rule changes, glob fixes).
   */
  private getVersion(): string {
    try {
      const pkgPath = join(__dirname, '../../package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
        version?: string;
      };
      const version = pkg.version || '0.0.0';

      // Include dist/ directory mtime as build fingerprint
      // This ensures any rebuild (even without version bump) invalidates the cache
      try {
        const distPath = join(__dirname, '..');
        const distStats = statSync(distPath);
        return `${version}-${distStats.mtime.getTime()}`;
      } catch {
        return version;
      }
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
      this.diagnostics?.warn(
        `Failed to save cache index: ${error instanceof Error ? error.message : String(error)}`,
        'CacheManager',
        'CACHE_SAVE_FAILED'
      );
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
      this.diagnostics?.warn(
        `Failed to cache result: ${error instanceof Error ? error.message : String(error)}`,
        'CacheManager',
        'CACHE_WRITE_FAILED'
      );
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
        this.diagnostics?.error(
          `Failed to clear cache: ${error instanceof Error ? error.message : String(error)}`,
          'CacheManager',
          'CACHE_CLEAR_FAILED'
        );
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
