/**
 * Markdownlint Programmatic API Wrapper
 *
 * Provides a clean interface to Markdownlint's programmatic API.
 * Faster than execSync and better error handling.
 */

import { glob } from 'glob';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface MarkdownlintResult {
  passed: boolean;
  errors: Record<string, string[]>;
  filesWithErrors: string[];
  filesFixed: string[];
}

interface LintViolation {
  lineNumber: number;
  ruleNames: string[];
  ruleDescription: string;
  fixInfo?: {
    editColumn?: number;
    deleteCount?: number;
    insertText?: string;
    lineNumber?: number;
  } | null;
}

type LintResults = Record<string, LintViolation[]>;

type LintFn = (options: {
  files?: string[];
  strings?: Record<string, string>;
  config: Record<string, unknown>;
  resultVersion?: number;
}) => LintResults;

type ApplyFixesFn = (input: string, errors: LintViolation[]) => string;

/**
 * Load markdownlint config from the project.
 */
function loadConfig(): Record<string, unknown> {
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

  return config;
}

/**
 * Expand glob patterns to a unique file list.
 */
async function expandPatterns(patterns: string[]): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: ['node_modules/**'] });
    files.push(...matches);
  }
  return [...new Set(files)];
}

/**
 * Check markdown files with markdownlint (report only, no writes).
 */
export async function checkMarkdownlint(
  patterns: string[],
  fix: boolean = false
): Promise<MarkdownlintResult> {
  if (fix) {
    return fixMarkdownlint(patterns);
  }

  // Dynamic import -- markdownlint 0.40+ is ESM-only
  // @ts-expect-error -- subpath exports require moduleResolution node16+
  const mdlintSync = (await import('markdownlint/sync')) as { lint: LintFn };

  const uniqueFiles = await expandPatterns(patterns);

  if (uniqueFiles.length === 0) {
    return { passed: true, errors: {}, filesWithErrors: [], filesFixed: [] };
  }

  const config = loadConfig();
  const results = mdlintSync.lint({ files: uniqueFiles, config });

  const errors: Record<string, string[]> = {};
  const filesWithErrors: string[] = [];

  for (const [file, violations] of Object.entries(results)) {
    if (violations.length > 0) {
      filesWithErrors.push(file);
      errors[file] = violations.map(
        (v) => `${v.lineNumber}:${v.ruleNames[0]} ${v.ruleDescription}`
      );
    }
  }

  return { passed: filesWithErrors.length === 0, errors, filesWithErrors, filesFixed: [] };
}

/**
 * Fix markdown files with markdownlint using applyFixes.
 *
 * Lints with resultVersion 3 (includes fixInfo), applies fixes via
 * markdownlint's applyFixes(), writes the result, then re-lints to
 * report any remaining unfixable violations.
 */
export async function fixMarkdownlint(patterns: string[]): Promise<MarkdownlintResult> {
  // Dynamic imports -- markdownlint 0.40+ is ESM-only
  // @ts-expect-error -- subpath exports require moduleResolution node16+
  const mdlintSync = (await import('markdownlint/sync')) as { lint: LintFn };
  // @ts-expect-error -- ESM dynamic import type mismatch
  const mdlintMain = (await import('markdownlint')) as { applyFixes: ApplyFixesFn };

  const uniqueFiles = await expandPatterns(patterns);

  if (uniqueFiles.length === 0) {
    return { passed: true, errors: {}, filesWithErrors: [], filesFixed: [] };
  }

  const config = loadConfig();
  const filesFixed: string[] = [];

  // First pass: lint with fixInfo, apply fixes, write back
  for (const file of uniqueFiles) {
    const content = readFileSync(file, 'utf-8');
    const results = mdlintSync.lint({
      strings: { [file]: content },
      config,
      resultVersion: 3,
    });

    const violations = results[file] || [];
    const hasFixable = violations.some((v) => v.fixInfo);

    if (hasFixable) {
      const fixed = mdlintMain.applyFixes(content, violations);
      if (fixed !== content) {
        writeFileSync(file, fixed, 'utf-8');
        filesFixed.push(file);
      }
    }
  }

  // Second pass: re-lint to find remaining unfixable issues
  const finalResults = mdlintSync.lint({ files: uniqueFiles, config });

  const errors: Record<string, string[]> = {};
  const filesWithErrors: string[] = [];

  for (const [file, violations] of Object.entries(finalResults)) {
    if (violations.length > 0) {
      filesWithErrors.push(file);
      errors[file] = violations.map(
        (v) => `${v.lineNumber}:${v.ruleNames[0]} ${v.ruleDescription}`
      );
    }
  }

  return { passed: filesWithErrors.length === 0, errors, filesWithErrors, filesFixed };
}
