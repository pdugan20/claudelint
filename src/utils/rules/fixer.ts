/**
 * Auto-fix functionality for claudelint
 *
 * Applies automatic fixes to resolve validation issues.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createTwoFilesPatch } from 'diff';
import { AutoFix } from '../../validators/file-validator';

export interface FixerOptions {
  /** Run in dry-run mode (don't actually modify files) */
  dryRun?: boolean;
  /** Which types of issues to fix: 'errors', 'warnings', or 'all' */
  fixType?: 'errors' | 'warnings' | 'all';
}

export interface FixResult {
  /** Number of fixes successfully applied */
  fixesApplied: number;
  /** Number of files modified */
  filesFixed: number;
  /** Files that were modified */
  modifiedFiles: string[];
  /** Fixes that failed to apply */
  failedFixes: Array<{ fix: AutoFix; error: string }>;
  /** Unified diff output for preview */
  diff?: string;
}

export class Fixer {
  private fixes: Map<string, AutoFix[]> = new Map();
  private options: FixerOptions;

  constructor(options: FixerOptions = {}) {
    this.options = {
      dryRun: false,
      fixType: 'all',
      ...options,
    };
  }

  /**
   * Register a fix to be applied
   */
  registerFix(fix: AutoFix): void {
    const existing = this.fixes.get(fix.filePath) || [];
    existing.push(fix);
    this.fixes.set(fix.filePath, existing);
  }

  /**
   * Apply all registered fixes
   */
  applyFixes(): FixResult {
    const result: FixResult = {
      fixesApplied: 0,
      filesFixed: 0,
      modifiedFiles: [],
      failedFixes: [],
      diff: '',
    };

    const diffs: string[] = [];

    for (const [filePath, fileFixes] of this.fixes.entries()) {
      try {
        // Read current file content (empty string if file doesn't exist)
        const fileExists = existsSync(filePath);
        const originalContent = fileExists ? readFileSync(filePath, 'utf-8') : '';
        let currentContent = originalContent;

        // Apply all fixes for this file
        for (const fix of fileFixes) {
          try {
            currentContent = fix.apply(currentContent);
            result.fixesApplied++;
          } catch (error) {
            result.failedFixes.push({
              fix,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Check if content actually changed
        if (currentContent !== originalContent) {
          // Generate unified diff
          const diff = createTwoFilesPatch(
            filePath,
            filePath,
            originalContent,
            currentContent,
            'original',
            'fixed'
          );
          diffs.push(diff);

          // Apply fix if not dry-run
          if (!this.options.dryRun) {
            writeFileSync(filePath, currentContent, 'utf-8');
          }

          result.filesFixed++;
          result.modifiedFiles.push(filePath);
        }
      } catch (error) {
        // Mark all fixes for this file as failed
        for (const fix of fileFixes) {
          result.failedFixes.push({
            fix,
            error: `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
          });
        }
      }
    }

    result.diff = diffs.join('\n');

    return result;
  }

  /**
   * Get count of registered fixes
   */
  getFixCount(): number {
    let count = 0;
    for (const fixes of this.fixes.values()) {
      count += fixes.length;
    }
    return count;
  }

  /**
   * Get count of files with fixes
   */
  getFileCount(): number {
    return this.fixes.size;
  }

  /**
   * Clear all registered fixes
   */
  clear(): void {
    this.fixes.clear();
  }
}
