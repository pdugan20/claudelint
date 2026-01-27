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
export function extractImports(content: string): string[] {
  const importRegex = /@([^\s]+)/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
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
 * Check if content starts with H1 heading (required by markdownlint MD041)
 */
export function startsWithH1(content: string): boolean {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    return false;
  }
  return lines[0].startsWith('# ');
}

/**
 * Validate markdown structure for common issues
 */
export interface MarkdownIssue {
  line: number;
  message: string;
  rule: string;
}

export function validateMarkdownStructure(content: string): MarkdownIssue[] {
  const issues: MarkdownIssue[] = [];
  const lines = content.split('\n');

  // Check for H1 heading at start (MD041)
  if (!startsWithH1(content)) {
    issues.push({
      line: 1,
      message: 'First line must be a top-level heading (H1)',
      rule: 'MD041',
    });
  }

  // Check for blank lines around code blocks (MD031)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';

    // Opening code fence
    if (line.startsWith('```')) {
      if (prevLine && prevLine.trim() !== '') {
        issues.push({
          line: i + 1,
          message: 'Code block must have blank line before it',
          rule: 'MD031',
        });
      }
    }

    // Closing code fence (rough heuristic)
    if (line === '```' && i > 0 && lines[i - 1] !== '```') {
      if (nextLine && nextLine.trim() !== '') {
        issues.push({
          line: i + 1,
          message: 'Code block must have blank line after it',
          rule: 'MD031',
        });
      }
    }
  }

  return issues;
}
