/**
 * Rule: claude-md-npm-script-not-found
 *
 * Errors when CLAUDE.md references `npm run <script>` but the script
 * does not exist in the nearest package.json.
 */

import { Rule } from '../../types/rule';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

/**
 * Walk up from startDir to find the nearest package.json.
 * Returns parsed scripts object or null.
 */
function findPackageScripts(startDir: string): Record<string, string> | null {
  let dir = startDir;
  const root = '/';

  while (dir !== root) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          scripts?: Record<string, string>;
        };
        return pkg.scripts ?? {};
      } catch {
        return null;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Extract `npm run <script>` references with line numbers from markdown.
 * Skips references inside code block comments (lines starting with #).
 */
function extractNpmRunReferences(content: string): Array<{ script: string; line: number }> {
  const lines = content.split('\n');
  const refs: Array<{ script: string; line: number }> = [];
  const npmRunRegex = /npm\s+run\s+([\w:.-]+)/g;

  for (let i = 0; i < lines.length; i++) {
    let match;
    while ((match = npmRunRegex.exec(lines[i])) !== null) {
      refs.push({ script: match[1], line: i + 1 });
    }
  }

  return refs;
}

export const rule: Rule = {
  meta: {
    id: 'claude-md-npm-script-not-found',
    name: 'npm Script Not Found',
    description: 'npm run script referenced in CLAUDE.md does not exist in package.json',
    category: 'CLAUDE.md',
    severity: 'error',
    fixable: false,
    deprecated: false,
    since: '1.0.0',
    docUrl:
      'https://github.com/pdugan20/claudelint/blob/main/docs/rules/claude-md/claude-md-npm-script-not-found.md',
  },

  validate: (context) => {
    const { filePath, fileContent } = context;

    // Only validate CLAUDE.md files
    if (!filePath.endsWith('.md')) return;

    const scripts = findPackageScripts(dirname(filePath));
    if (!scripts) return; // No package.json found — skip silently

    const refs = extractNpmRunReferences(fileContent);

    for (const ref of refs) {
      if (!(ref.script in scripts)) {
        context.report({
          message: `npm script "${ref.script}" is referenced but does not exist in package.json`,
          line: ref.line,
          fix: `Add "${ref.script}" to package.json scripts or fix the reference`,
        });
      }
    }
  },
};
