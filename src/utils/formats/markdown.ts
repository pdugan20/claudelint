/**
 * Utilities for parsing and validating markdown files
 */

import yaml from 'js-yaml';

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
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      content,
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

export function extractImports(content: string): string[] {
  // Remove code blocks (triple backticks) to avoid matching @ inside code
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (single backticks) to avoid matching @ inside inline code
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, '');

  const importRegex = /@([^\s]+)/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(withoutInlineCode)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

export function extractImportsWithLineNumbers(content: string): Import[] {
  const lines = content.split('\n');
  const imports: Import[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block boundaries (triple backticks)
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip lines inside code blocks
    if (inCodeBlock) {
      continue;
    }

    // Remove inline code (single backticks) from this line
    const withoutInlineCode = line.replace(/`[^`]*`/g, '');

    const importRegex = /@([^\s]+)/g;
    let match;

    while ((match = importRegex.exec(withoutInlineCode)) !== null) {
      imports.push({
        path: match[1],
        line: i + 1,
      });
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
    const fieldRegex = new RegExp(`^\\s*${fieldName}\\s*:`);
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
  const parts = content.split('---');

  // Need at least 3 parts: empty, frontmatter, body
  // Format: ---\nfrontmatter\n---\nbody
  if (parts.length < 3) {
    return '';
  }

  // Join everything after the second --- (in case body contains ---)
  return parts.slice(2).join('---').trim();
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
