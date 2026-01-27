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
  const importRegex = /@([^\s]+)/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

export function extractImportsWithLineNumbers(content: string): Import[] {
  const lines = content.split('\n');
  const imports: Import[] = [];

  for (let i = 0; i < lines.length; i++) {
    const importRegex = /@([^\s]+)/g;
    let match;

    while ((match = importRegex.exec(lines[i])) !== null) {
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
