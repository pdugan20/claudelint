/**
 * Helper utilities for custom rules
 *
 * Provides commonly-needed functions for validating files,
 * parsing content, and checking patterns.
 *
 * Import in custom rules:
 * ```javascript
 * const { hasHeading, matchesPattern } = require('claudelint/utils');
 * ```
 *
 * Note: Some functions (fileExists, readFileContent, extractFrontmatter) are
 * re-exported from existing modules for convenience.
 */

import yaml from 'js-yaml';

// Re-export commonly used functions from other modules
export { fileExists, readFileContent } from './file-system';
export { extractFrontmatter, type FrontmatterResult } from './markdown';

/**
 * Check if markdown content contains a heading at a specific level
 *
 * @param content - Markdown content to search
 * @param text - Heading text to find (case-insensitive)
 * @param level - Heading level (1-6, default: any level)
 * @returns True if heading exists
 *
 * @example
 * if (!hasHeading(content, 'Overview', 2)) {
 *   context.report({ message: 'Missing ## Overview section' });
 * }
 */
export function hasHeading(content: string, text: string, level?: number): boolean {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (level) {
    // Match specific heading level
    const regex = new RegExp(`^#{${level}}\\s+${escapedText}\\s*$`, 'im');
    return regex.test(content);
  } else {
    // Match any heading level
    const regex = new RegExp(`^#{1,6}\\s+${escapedText}\\s*$`, 'im');
    return regex.test(content);
  }
}

/**
 * Extract all headings from markdown content
 *
 * @param content - Markdown content to parse
 * @returns Array of headings with level and text
 *
 * @example
 * const headings = extractHeadings(content);
 * if (headings.length === 0) {
 *   context.report({ message: 'File has no headings' });
 * }
 */
export interface Heading {
  level: number;
  text: string;
  line: number;
}

export function extractHeadings(content: string): Heading[] {
  const lines = content.split('\n');
  const headings: Heading[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headingRegex);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1,
      });
    }
  }

  return headings;
}

/**
 * Check if content matches a regular expression pattern
 *
 * @param content - Content to search
 * @param pattern - Regular expression to match
 * @returns True if pattern matches
 *
 * @example
 * if (matchesPattern(content, /TODO:|FIXME:/i)) {
 *   context.report({ message: 'Found TODO comments' });
 * }
 */
export function matchesPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

/**
 * Count occurrences of a string or pattern in content
 *
 * @param content - Content to search
 * @param search - String or RegExp to count
 * @returns Number of matches
 *
 * @example
 * const count = countOccurrences(content, /\bTODO\b/g);
 * if (count > 5) {
 *   context.report({ message: `Too many TODOs (${count})` });
 * }
 */
export function countOccurrences(content: string, search: string | RegExp): number {
  if (typeof search === 'string') {
    let count = 0;
    let pos = 0;
    while ((pos = content.indexOf(search, pos)) !== -1) {
      count++;
      pos += search.length;
    }
    return count;
  } else {
    // For RegExp, ensure global flag
    const regex = new RegExp(search.source, search.flags.includes('g') ? search.flags : search.flags + 'g');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }
}

// fileExists and extractFrontmatter are re-exported from other modules above
// No duplicate implementations needed

/**
 * Validate semantic versioning format
 *
 * @param version - Version string to validate
 * @returns True if valid semver format
 *
 * @example
 * if (!validateSemver(pluginVersion)) {
 *   context.report({ message: 'Invalid version format' });
 * }
 */
export function validateSemver(version: string): boolean {
  const semverPattern =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverPattern.test(version);
}

// fileExists and readFileContent re-exported from './file-system' above

/**
 * Safely parse JSON content
 *
 * @param content - JSON string to parse
 * @returns Parsed object or null if invalid
 *
 * @example
 * const config = parseJSON(context.fileContent);
 * if (!config) {
 *   context.report({ message: 'Invalid JSON' });
 * }
 */
export function parseJSON(content: string): Record<string, unknown> | null {
  try {
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Safely parse YAML content
 *
 * @param content - YAML string to parse
 * @returns Parsed object or null if invalid
 *
 * @example
 * const config = parseYAML(context.fileContent);
 * if (!config) {
 *   context.report({ message: 'Invalid YAML' });
 * }
 */
export function parseYAML(content: string): Record<string, unknown> | null {
  try {
    const parsed = yaml.load(content);
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Find all lines matching a pattern
 *
 * @param content - Content to search
 * @param pattern - Pattern to match
 * @returns Array of { line: number, text: string, match: string }
 *
 * @example
 * const matches = findLinesMatching(content, /password\s*=\s*['"](.+)['"]/i);
 * matches.forEach(m => {
 *   context.report({
 *     message: 'Hardcoded password detected',
 *     line: m.line
 *   });
 * });
 */
export interface LineMatch {
  line: number;
  text: string;
  match: string;
}

export function findLinesMatching(content: string, pattern: RegExp): LineMatch[] {
  const lines = content.split('\n');
  const matches: LineMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (match) {
      matches.push({
        line: i + 1,
        text: lines[i],
        match: match[0],
      });
    }
  }

  return matches;
}
