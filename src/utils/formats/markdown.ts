/**
 * Utilities for parsing and validating markdown files
 */

import yaml from 'js-yaml';
import { escapeRegExp, isImportPath } from '../patterns';

export interface FrontmatterResult<T = Record<string, unknown>> {
  frontmatter: T | null;
  content: string;
  hasFrontmatter: boolean;
}

/**
 * Extract YAML frontmatter from markdown content
 */
export function extractFrontmatter<T = Record<string, unknown>>(
  content: string
): FrontmatterResult<T> {
  // P1-4: Normalize Windows line endings to avoid \r in captured groups
  const normalized = content.replace(/\r\n/g, '\n');
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = normalized.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      content: normalized,
      hasFrontmatter: false,
    };
  }

  const [, frontmatterYaml, markdownContent] = match;

  try {
    const frontmatter = yaml.load(frontmatterYaml) as T;

    return {
      frontmatter,
      content: markdownContent,
      hasFrontmatter: true,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse YAML frontmatter: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract import statements from markdown content
 * Format: @path/to/file
 */
export interface Import {
  path: string;
  line: number;
}

/**
 * Extract import paths from markdown content (without line numbers).
 *
 * Delegates to `extractImportsWithLineNumbers()` and strips metadata.
 * This follows the "simple wraps complex" pattern from @eslint-community/eslint-utils.
 */
export function extractImports(content: string): string[] {
  return extractImportsWithLineNumbers(content).map((imp) => imp.path);
}

/**
 * Extract import statements with line numbers from markdown content.
 *
 * Skips code blocks (backtick and tilde fences) and inline code.
 * Filters out non-import @ references (decorators, JSDoc tags, emails)
 * using `isImportPath()` from patterns.ts.
 */
export function extractImportsWithLineNumbers(content: string): Import[] {
  const lines = content.split('\n');
  const imports: Import[] = [];
  let inCodeBlock = false;
  let fenceChar = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track code block boundaries (backtick and tilde fences)
    if (!inCodeBlock) {
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        inCodeBlock = true;
        fenceChar = trimmed[0];
        continue;
      }
    } else {
      if (
        (fenceChar === '`' && trimmed.startsWith('```') && !trimmed.startsWith('````')) ||
        (fenceChar === '~' && trimmed.startsWith('~~~') && !trimmed.startsWith('~~~~'))
      ) {
        inCodeBlock = false;
        fenceChar = '';
      }
      continue;
    }

    // Remove inline code (single backticks) from this line
    const withoutInlineCode = line.replace(/`[^`]*`/g, '');

    // Match @ references preceded by start of line or whitespace
    for (const match of withoutInlineCode.matchAll(/(?:^|\s)@(\S+)/g)) {
      const path = match[1];

      // Filter out decorators (@Injected), JSDoc tags (@param), etc.
      if (isImportPath(path)) {
        imports.push({ path, line: i + 1 });
      }
    }
  }

  return imports;
}

/**
 * Count lines in content
 */
export function countLines(content: string): number {
  return content.split('\n').length;
}

/**
 * Get the line number of a frontmatter field
 * Returns the line number (1-indexed) where the field is defined, or 1 if not found
 */
export function getFrontmatterFieldLine(content: string, fieldName: string): number {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return 1; // No frontmatter, default to line 1
  }

  const frontmatterYaml = match[1];
  const lines = frontmatterYaml.split('\n');

  for (let i = 0; i < lines.length; i++) {
    // Match field at start of line (accounting for whitespace)
    const escaped = escapeRegExp(fieldName);
    const fieldRegex = new RegExp(`^\\s*${escaped}\\s*:`);
    if (fieldRegex.test(lines[i])) {
      return i + 2; // +1 for 0-indexed, +1 for opening ---
    }
  }

  return 2; // Field not found, default to first line after opening ---
}

/**
 * Extracts body content (everything after frontmatter) from markdown
 *
 * Used by body content validation rules to check minimum length and required sections.
 *
 * @param content - The full markdown content including frontmatter
 * @returns Body content after frontmatter, or empty string if no body
 *
 * @example
 * const body = extractBodyContent(content);
 * if (body.length < 50) {
 *   context.report({ message: 'Body too short' });
 * }
 */
export function extractBodyContent(content: string): string {
  // P1-2: Use regex-based frontmatter boundary detection instead of naive split('---')
  // which breaks when YAML values contain '---'
  const normalized = content.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/);

  if (!match) {
    return '';
  }

  return match[1].trim();
}

/**
 * Checks if markdown body contains a section matching a pattern
 *
 * Used by body content validation rules to verify required sections exist.
 *
 * @param body - The markdown body content (after frontmatter)
 * @param sectionRegex - Regular expression to match section heading
 * @returns True if section is found
 *
 * @example
 * const hasSystemPrompt = hasMarkdownSection(body, /#{1,3}\s*system\s*prompt/i);
 * if (!hasSystemPrompt) {
 *   context.report({ message: 'Missing System Prompt section' });
 * }
 */
export function hasMarkdownSection(body: string, sectionRegex: RegExp): boolean {
  return sectionRegex.test(body);
}

/**
 * Strips fenced code blocks and inline code from markdown content.
 *
 * Uses line-by-line state tracking (not regex replacement) to correctly handle
 * unclosed fences, tilde fences (~~~), and nested backtick syntax. Code lines
 * are replaced with empty strings to preserve line numbers for downstream rules.
 */
export function stripCodeBlocks(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let fenceChar = '';

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (!inCodeBlock) {
      // Check for opening fence: ``` or ~~~
      if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
        inCodeBlock = true;
        fenceChar = trimmed[0];
        result.push('');
        continue;
      }
      // Strip inline code from non-fenced lines
      result.push(lines[i].replace(/`[^`]*`/g, ''));
    } else {
      // Check for closing fence: must match the opening fence character
      if (
        (fenceChar === '`' && trimmed.startsWith('```') && !trimmed.startsWith('````')) ||
        (fenceChar === '~' && trimmed.startsWith('~~~') && !trimmed.startsWith('~~~~'))
      ) {
        inCodeBlock = false;
        fenceChar = '';
      }
      result.push('');
    }
  }

  return result.join('\n');
}
