import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Parse .claudelintignore file
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
 * Check if path should be ignored based on patterns
 */
export function shouldIgnore(filePath: string, patterns: string[]): boolean {
  // Default ignores
  const defaultIgnores = ['node_modules/**', '.git/**', 'dist/**', 'build/**'];
  const allPatterns = [...defaultIgnores, ...patterns];

  for (const pattern of allPatterns) {
    if (matchesPattern(filePath, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Simple glob pattern matching
 */
function matchesPattern(filePath: string, pattern: string): boolean {
  // Check if pattern is for a directory
  const isDirectoryPattern = pattern.endsWith('/');
  let processPattern = pattern;

  // Remove trailing slash for processing
  if (isDirectoryPattern) {
    processPattern = pattern.slice(0, -1);
  }

  // Convert glob pattern to regex
  // Use placeholders to handle ** before *
  let regexPattern = processPattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*\*/g, '__DOUBLESTAR__') // Placeholder for **
    .replace(/\*/g, '[^/]*') // * matches anything except /
    .replace(/__DOUBLESTAR__/g, '.*'); // ** matches anything including /

  // If pattern was for a directory, match directory and its contents
  if (isDirectoryPattern) {
    regexPattern = `${regexPattern}(/.*)?`;
  }

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

/**
 * Load ignore patterns from .claudelintignore file
 */
export function loadIgnorePatterns(baseDir: string): string[] {
  const ignoreFilePath = join(baseDir, '.claudelintignore');
  return parseIgnoreFile(ignoreFilePath);
}
