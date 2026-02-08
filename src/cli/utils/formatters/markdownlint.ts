/**
 * Markdownlint Programmatic API Wrapper
 *
 * Provides a clean interface to Markdownlint's programmatic API.
 * Faster than execSync and better error handling.
 */

import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface MarkdownlintResult {
  passed: boolean;
  errors: Record<string, string[]>;
  filesWithErrors: string[];
}

interface LintViolation {
  lineNumber: number;
  ruleNames: string[];
  ruleDescription: string;
}

type LintResults = Record<string, LintViolation[]>;

type LintFn = (options: { files: string[]; config: Record<string, unknown> }) => LintResults;

/**
 * Check markdown files with markdownlint
 *
 * @param patterns - File glob patterns
 * @param fix - Whether to auto-fix issues
 * @returns Result with passed status and error details
 */
export async function checkMarkdownlint(
  patterns: string[],
  fix: boolean = false
): Promise<MarkdownlintResult> {
  // Dynamic import — markdownlint 0.40+ is ESM-only
  // @ts-expect-error -- subpath exports require moduleResolution node16+
  const mdlintSync = (await import('markdownlint/sync')) as { lint: LintFn };
  const lint = mdlintSync.lint;

  // Expand glob patterns to file list
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**'] });
    files.push(...matches);
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  if (uniqueFiles.length === 0) {
    return {
      passed: true,
      errors: {},
      filesWithErrors: [],
    };
  }

  // Load user's .markdownlint.json if it exists
  let config: Record<string, unknown> = { default: true };
  const configPath = join(process.cwd(), '.markdownlint.json');

  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf-8');
      config = JSON.parse(configContent) as Record<string, unknown>;
    } catch {
      // If config file is invalid, fall back to defaults
    }
  }

  // Run markdownlint
  const results = lint({
    files: uniqueFiles,
    config,
  });

  // Parse results
  const errors: Record<string, string[]> = {};
  const filesWithErrors: string[] = [];

  for (const [file, violations] of Object.entries(results)) {
    if (violations.length > 0) {
      filesWithErrors.push(file);
      errors[file] = violations.map(
        (v) => `${v.lineNumber}:${v.ruleNames[0]} ${v.ruleDescription}`
      );

      // Note: Auto-fix is handled by markdownlint-cli in scripts
      // The markdownlint programmatic API doesn't provide fix functionality
      // This parameter is reserved for future implementation
      if (fix) {
        // TODO: Implement fix functionality when markdownlint API supports it
      }
    }
  }

  return {
    passed: filesWithErrors.length === 0,
    errors,
    filesWithErrors,
  };
}
