/**
 * Rule: claude-md-file-reference-invalid
 *
 * Errors when CLAUDE.md references file paths (in inline code or code blocks)
 * that do not exist on disk. Only checks paths that look like real file
 * references (contain a dot extension or end with /), not arbitrary code.
 */

import { Rule } from '../../types/rule';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

/**
 * Pattern to match file-like paths: must contain a / and a dot-extension,
 * or end with /. Excludes URLs, template variables, and common non-path patterns.
 */
const FILE_PATH_REGEX = /(?:\.\/|[\w-]+\/)+[\w./-]+/g;

/**
 * Patterns to exclude from file reference checking.
 */
function shouldSkipPath(p: string, sourceText: string): boolean {
  // URLs — check the surrounding source text for URL context
  if (p.startsWith('http://') || p.startsWith('https://')) return true;
  if (sourceText.includes('http://') || sourceText.includes('https://')) return true;
  // npm package patterns (org scopes)
  if (p.startsWith('@')) return true;
  // Template variables
  if (p.includes('${') || p.includes('{{')) return true;
  if (sourceText.includes('${') || sourceText.includes('{{')) return true;
  // Glob wildcards — these are patterns, not literal paths
  if (p.includes('*') || p.includes('?')) return true;
  if (sourceText.includes('*') || sourceText.includes('?')) return true;
  // Version-like patterns (0.2.0, v1.0.0)
  if (/^\d+\.\d+/.test(p)) return true;
  // No extension and doesn't end with / — likely not a file ref
  if (!/\.\w+$/.test(p) && !p.endsWith('/')) return true;
  // Common code patterns that look like paths but aren't
  if (p.startsWith('node_modules/')) return true;
  if (p.startsWith('dist/')) return true;

  return false;
}

interface FileRef {
  path: string;
  line: number;
  sourceText: string;
}

/**
 * Extract file path references from inline code (backticks) and code blocks.
 */
function extractFileReferences(content: string): FileRef[] {
  const refs: FileRef[] = [];
  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track code block boundaries
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim().toLowerCase();
      } else {
        inCodeBlock = false;
        codeBlockLang = '';
      }
      continue;
    }

    // Inside code blocks: only check bash/shell blocks for file args,
    // skip other languages (json, yaml, typescript, etc.) since they
    // contain code patterns that look like paths but aren't references
    if (inCodeBlock) {
      if (codeBlockLang === 'bash' || codeBlockLang === 'sh' || codeBlockLang === 'shell') {
        // Skip comment lines
        if (trimmed.startsWith('#')) continue;

        let match;
        FILE_PATH_REGEX.lastIndex = 0;
        while ((match = FILE_PATH_REGEX.exec(line)) !== null) {
          refs.push({ path: match[0], line: i + 1, sourceText: line });
        }
      }
      continue;
    }

    // Outside code blocks: check inline code (backticks) only
    const inlineCodeRegex = /`([^`]+)`/g;
    let inlineMatch;
    while ((inlineMatch = inlineCodeRegex.exec(line)) !== null) {
      const code = inlineMatch[1];
      FILE_PATH_REGEX.lastIndex = 0;
      let pathMatch;
      while ((pathMatch = FILE_PATH_REGEX.exec(code)) !== null) {
        refs.push({ path: pathMatch[0], line: i + 1, sourceText: code });
      }
    }
  }

  return refs;
}

export const rule: Rule = {
  meta: {
    id: 'claude-md-file-reference-invalid',
    name: 'File Reference Invalid',
    description: 'File path referenced in CLAUDE.md does not exist',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-file-reference-invalid.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    if (!filePath.endsWith('.md')) return;

    const baseDir = dirname(filePath);
    const refs = extractFileReferences(fileContent);

    for (const ref of refs) {
      if (shouldSkipPath(ref.path, ref.sourceText)) continue;

      const resolved = resolve(baseDir, ref.path);
      if (!existsSync(resolved)) {
        context.report({
          message: `File reference "${ref.path}" does not exist`,
          line: ref.line,
          fix: `Create the file or update the path`,
        });
      }
    }
  },
};
