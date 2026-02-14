import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';
import ignore, { Ignore } from 'ignore';

/**
 * Default ignore patterns applied to all file discovery.
 *
 * Kept as a single canonical list — no duplicates elsewhere.
 */
export const DEFAULT_IGNORES = ['node_modules', '.git', 'dist', 'build', 'coverage'];

/**
 * Parse a .claudelintignore file into an array of pattern strings.
 *
 * Follows .gitignore format: lines starting with # are comments,
 * blank lines are skipped.
 */
export function parseIgnoreFile(ignoreFilePath: string): string[] {
  if (!existsSync(ignoreFilePath)) {
    return [];
  }

  const content = readFileSync(ignoreFilePath, 'utf-8');
  const lines = content.split('\n');
  const patterns: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    patterns.push(trimmed);
  }

  return patterns;
}

/**
 * Create a node-ignore filter for a project directory.
 *
 * Loads patterns from .claudelintignore and adds default ignores.
 * Uses the `ignore` package (same as ESLint/Prettier) for full
 * .gitignore spec compliance.
 */
export function createIgnoreFilter(baseDir: string): Ignore {
  const ig = ignore();

  // Add default ignores
  ig.add(DEFAULT_IGNORES);

  // Load custom patterns from .claudelintignore
  const ignoreFilePath = join(baseDir, '.claudelintignore');
  const customPatterns = parseIgnoreFile(ignoreFilePath);
  if (customPatterns.length > 0) {
    ig.add(customPatterns);
  }

  return ig;
}

/**
 * Check if a relative path should be ignored.
 *
 * @param filePath - Path relative to the project root
 * @param baseDir - Project root directory (for loading .claudelintignore)
 */
export function isIgnored(filePath: string, baseDir: string): boolean {
  const ig = createIgnoreFilter(baseDir);
  return ig.ignores(filePath);
}

/**
 * Filter an array of absolute paths, removing ignored ones.
 *
 * Converts absolute paths to relative (using baseDir) for matching,
 * then returns the non-ignored absolute paths.
 */
export function filterIgnored(absolutePaths: string[], baseDir: string): string[] {
  const ig = createIgnoreFilter(baseDir);

  return absolutePaths.filter((absPath) => {
    const relPath = relative(baseDir, absPath);
    // Paths outside baseDir won't match ignore rules — keep them
    if (relPath.startsWith('..')) return true;
    return !ig.ignores(relPath);
  });
}
