/**
 * Validation Cache
 *
 * Caches validation results to speed up repeated validations.
 * Cache invalidation is based on:
 * - claudelint version (including build fingerprint)
 * - Validator name
 * - Configuration (rules, options)
 * - Validated file modification times (tracked per-entry)
 */

import { createHash } from 'crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  unlinkSync,
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
  /** Hash of (version + validatorName + config) for lookup */
  hash: string;
  /** When this entry was created */
  timestamp: number;
  /** Filename of the cached result JSON */
  resultFile: string;
  /** File paths and their mtimes at cache time (for invalidation) */
  fileFingerprints: Record<string, string>;
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

      // Use dist/index.js mtime as build fingerprint (more reliable than directory mtime)
      try {
        const entryPath = join(__dirname, '..', 'index.js');
        const entryStats = statSync(entryPath);
        return `${version}-${entryStats.mtime.getTime()}`;
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
          this.cleanupStaleFiles(index);
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
   * Generate cache key for a validator (identifies which entry to look up)
   *
   * File mtimes are NOT included in the key — they are verified separately
   * via fileFingerprints stored in the cache entry.
   */
  getCacheKey(validatorName: string, config?: unknown): string {
    const hash = createHash('sha256');

    // Include claudelint version
    hash.update(this.version);

    // Include validator name
    hash.update(validatorName);

    // Include config in hash (critical for cache invalidation when config changes)
    if (config) {
      hash.update(JSON.stringify(config));
    }

    return hash.digest('hex');
  }

  /**
   * Compute file fingerprints (path -> mtime) for a list of files
   */
  private computeFileFingerprints(files: string[]): Record<string, string> {
    const fingerprints: Record<string, string> = {};
    for (const file of files.sort()) {
      try {
        if (existsSync(file)) {
          const stats = statSync(file);
          fingerprints[file] = stats.mtime.toISOString();
        }
      } catch {
        // File inaccessible — skip (will cause cache miss on next get)
      }
    }
    return fingerprints;
  }

  /**
   * Check if stored file fingerprints still match current file state
   */
  private areFingerprintsValid(stored: Record<string, string>): boolean {
    const storedFiles = Object.keys(stored);

    // No files tracked — always valid (e.g., validators that found no files)
    if (storedFiles.length === 0) {
      return true;
    }

    for (const file of storedFiles) {
      try {
        if (!existsSync(file)) {
          // File was deleted since cache was created
          return false;
        }
        const stats = statSync(file);
        if (stats.mtime.toISOString() !== stored[file]) {
          // File was modified since cache was created
          return false;
        }
      } catch {
        // Can't stat file — treat as changed
        return false;
      }
    }

    return true;
  }

  /**
   * Get cached result for a validator
   *
   * Returns null (cache miss) if:
   * - Cache is disabled
   * - No entry exists for this validator + config combination
   * - Any validated file has been modified since caching
   * - Cache file is missing or corrupt
   */
  get(validatorName: string, config?: unknown): ValidationResult | null;
  /**
   * @deprecated Pass config as second argument. projectFiles parameter is ignored.
   */
  get(validatorName: string, projectFiles: string[], config?: unknown): ValidationResult | null;
  get(
    validatorName: string,
    configOrFiles?: unknown,
    maybeConfig?: unknown
  ): ValidationResult | null {
    if (!this.options.enabled) {
      return null;
    }

    // Handle both old and new signatures
    const config = Array.isArray(configOrFiles) ? maybeConfig : configOrFiles;

    const cacheKey = this.getCacheKey(validatorName, config);
    const entry = this.index.entries[validatorName];

    if (!entry || entry.hash !== cacheKey) {
      return null;
    }

    // Verify file fingerprints — the core invalidation check
    if (!this.areFingerprintsValid(entry.fileFingerprints)) {
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
   *
   * File fingerprints are extracted from result.validatedFiles.
   * If no validatedFiles are present, files referenced in errors/warnings are used.
   */
  set(validatorName: string, result: ValidationResult, config?: unknown): void;
  /**
   * @deprecated Pass config as third argument. projectFiles parameter is ignored.
   */
  set(
    validatorName: string,
    result: ValidationResult,
    projectFiles: string[],
    config?: unknown
  ): void;
  set(
    validatorName: string,
    result: ValidationResult,
    configOrFiles?: unknown,
    maybeConfig?: unknown
  ): void {
    if (!this.options.enabled) {
      return;
    }

    // Handle both old and new signatures
    const config = Array.isArray(configOrFiles) ? maybeConfig : configOrFiles;

    try {
      const cacheKey = this.getCacheKey(validatorName, config);
      const resultFileName = `${cacheKey}.json`;
      const resultPath = join(this.filesDir, resultFileName);

      // Clean up old result file if entry exists with different hash
      this.cleanupEntryFile(validatorName);

      // Ensure directories exist
      if (!existsSync(this.filesDir)) {
        mkdirSync(this.filesDir, { recursive: true });
      }

      // Extract files to fingerprint from result
      const filesToTrack = this.extractFilesFromResult(result);
      const fileFingerprints = this.computeFileFingerprints(filesToTrack);

      // Write result file (strip validatedFiles to save space — we have fingerprints)
      const storedResult = { ...result };
      delete storedResult.validatedFiles;
      writeFileSync(resultPath, JSON.stringify(storedResult, null, 2), 'utf-8');

      // Update index
      this.index.entries[validatorName] = {
        hash: cacheKey,
        timestamp: Date.now(),
        resultFile: resultFileName,
        fileFingerprints,
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
   * Extract file paths from a validation result for fingerprinting
   *
   * Prefers result.validatedFiles (set by validators during file discovery).
   * Falls back to files referenced in errors and warnings.
   */
  private extractFilesFromResult(result: ValidationResult): string[] {
    // Prefer explicit validatedFiles from the validator
    if (result.validatedFiles && result.validatedFiles.length > 0) {
      return result.validatedFiles;
    }

    // Fallback: extract unique file paths from errors and warnings
    const files = new Set<string>();
    for (const error of result.errors) {
      if (error.file) {
        files.add(error.file);
      }
    }
    for (const warning of result.warnings) {
      if (warning.file) {
        files.add(warning.file);
      }
    }
    return [...files];
  }

  /**
   * Delete the cached result file for a validator entry (if it exists)
   */
  private cleanupEntryFile(validatorName: string): void {
    const entry = this.index.entries[validatorName];
    if (entry) {
      const oldPath = join(this.filesDir, entry.resultFile);
      try {
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      } catch {
        // Best-effort cleanup
      }
    }
  }

  /**
   * Clean up all result files from a stale index (e.g., after version change)
   */
  private cleanupStaleFiles(staleIndex: CacheIndex): void {
    for (const entry of Object.values(staleIndex.entries)) {
      const filePath = join(this.filesDir, entry.resultFile);
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      } catch {
        // Best-effort cleanup
      }
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
