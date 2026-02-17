/**
 * Type-level assertions for the public API
 *
 * These assertions verify that the public API types match expectations.
 * They are checked at compile time by tsd — no runtime execution needed.
 */

import { expectType, expectAssignable } from 'tsd';
import {
  lint,
  lintText,
  formatResults,
  resolveConfig,
  getFileInfo,
  loadFormatter,
  ClaudeLint,
  BUILTIN_FORMATTERS,
} from '.';
import type {
  LintResult,
  ClaudeLintOptions,
  LintOptions,
  Formatter,
  RuleMetadata,
  FileInfo,
  ClaudeLintConfig,
} from '.';

// === Functional API ===

// lint() returns Promise<LintResult[]>
expectType<Promise<LintResult[]>>(lint(['**/*.md']));
expectType<Promise<LintResult[]>>(lint(['**/*.md'], { fix: true }));

// lintText() returns Promise<LintResult[]>
expectType<Promise<LintResult[]>>(lintText('# Test'));
expectType<Promise<LintResult[]>>(lintText('# Test', { filePath: 'CLAUDE.md' }));

// formatResults() returns Promise<string>
expectType<Promise<string>>(formatResults([] as LintResult[]));
expectType<Promise<string>>(formatResults([] as LintResult[], 'json'));

// resolveConfig() returns Promise<ClaudeLintConfig>
expectType<Promise<ClaudeLintConfig>>(resolveConfig('CLAUDE.md'));

// getFileInfo() returns Promise<FileInfo>
expectType<Promise<FileInfo>>(getFileInfo('CLAUDE.md'));

// loadFormatter() returns Promise<Formatter>
expectType<Promise<Formatter>>(loadFormatter('stylish'));

// === ClaudeLint Class ===

// Constructor accepts ClaudeLintOptions
const linter = new ClaudeLint();
void new ClaudeLint({ fix: true, cache: true });

// Instance methods
expectType<Promise<LintResult[]>>(linter.lintFiles(['**/*.md']));
expectType<Promise<LintResult[]>>(linter.lintText('# Test'));
expectType<Promise<Formatter>>(linter.loadFormatter('stylish'));
expectType<Map<string, RuleMetadata>>(linter.getRules());
expectType<Map<string, RuleMetadata>>(linter.getRulesMetaForResults([]));
expectType<Promise<ClaudeLintConfig>>(linter.calculateConfigForFile('test.md'));
expectType<boolean>(linter.isPathIgnored('test.md'));

// Static methods
expectType<Promise<void>>(ClaudeLint.outputFixes([]));
expectType<Map<string, string>>(ClaudeLint.getFixedContent([]));
expectType<LintResult[]>(ClaudeLint.getErrorResults([]));
expectType<LintResult[]>(ClaudeLint.getWarningResults([]));
expectType<string | null>(ClaudeLint.findConfigFile('.'));
expectType<string>(ClaudeLint.getVersion());

// === Type aliases ===

// LintOptions is an alias for ClaudeLintOptions
expectAssignable<LintOptions>({} as ClaudeLintOptions);
expectAssignable<ClaudeLintOptions>({} as LintOptions);

// === Constants ===

// BUILTIN_FORMATTERS is a readonly array
expectType<readonly ['stylish', 'json', 'compact', 'sarif', 'github']>(BUILTIN_FORMATTERS);
