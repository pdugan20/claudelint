import {
  buildLintResult,
  buildCleanResult,
  mergeLintResults,
  sortLintResult,
} from '../../src/api/result-builder';
import { ValidationResult } from '../../src/validators/file-validator';
import { LintResult } from '../../src/api/types';

describe('result-builder', () => {
  describe('buildLintResult', () => {
    it('should build a result with errors and warnings', () => {
      const validationResult: ValidationResult = {
        valid: false,
        errors: [
          { message: 'Error 1', severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [
          { message: 'Warning 1', severity: 'warning', ruleId: 'claude-md-size' },
        ],
      };

      const result = buildLintResult('/path/to/file.md', validationResult);

      expect(result.filePath).toBe('/path/to/file.md');
      expect(result.errorCount).toBe(1);
      expect(result.warningCount).toBe(1);
      expect(result.messages).toHaveLength(2);
      expect(result.suppressedMessages).toEqual([]);
    });

    it('should calculate fixable counts', () => {
      const validationResult: ValidationResult = {
        valid: false,
        errors: [
          {
            message: 'Fixable error',
            severity: 'error',
            autoFix: {
              ruleId: 'claude-md-size',
              description: 'Fix',
              filePath: '/file.md',
              apply: (c: string) => c,
            },
          },
          { message: 'Non-fixable error', severity: 'error' },
        ],
        warnings: [],
      };

      const result = buildLintResult('/file.md', validationResult);

      expect(result.fixableErrorCount).toBe(1);
      expect(result.fixableWarningCount).toBe(0);
    });

    it('should include source when provided', () => {
      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      const result = buildLintResult('/file.md', validationResult, '# Source');

      expect(result.source).toBe('# Source');
    });

    it('should include output when provided', () => {
      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      const result = buildLintResult('/file.md', validationResult, '# Src', '# Fixed');

      expect(result.output).toBe('# Fixed');
    });

    it('should include stats when validation time provided', () => {
      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      const result = buildLintResult('/file.md', validationResult, undefined, undefined, 45);

      expect(result.stats).toEqual({ validationTime: 45 });
    });

    it('should include deprecated rules when present', () => {
      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        deprecatedRulesUsed: [
          {
            ruleId: 'commands-deprecated-directory',
            reason: 'Use skills instead',
          },
        ],
      };

      const result = buildLintResult('/file.md', validationResult);

      expect(result.deprecatedRulesUsed).toHaveLength(1);
      expect(result.deprecatedRulesUsed![0].ruleId).toBe('commands-deprecated-directory');
    });

    it('should not include deprecated rules when empty', () => {
      const validationResult: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        deprecatedRulesUsed: [],
      };

      const result = buildLintResult('/file.md', validationResult);

      expect(result.deprecatedRulesUsed).toBeUndefined();
    });
  });

  describe('buildCleanResult', () => {
    it('should build a clean result with zero counts', () => {
      const result = buildCleanResult('/file.md');

      expect(result.filePath).toBe('/file.md');
      expect(result.messages).toEqual([]);
      expect(result.errorCount).toBe(0);
      expect(result.warningCount).toBe(0);
      expect(result.fixableErrorCount).toBe(0);
      expect(result.fixableWarningCount).toBe(0);
    });

    it('should include source when provided', () => {
      const result = buildCleanResult('/file.md', '# Content');

      expect(result.source).toBe('# Content');
    });

    it('should include stats when validation time provided', () => {
      const result = buildCleanResult('/file.md', undefined, 23);

      expect(result.stats).toEqual({ validationTime: 23 });
    });

    it('should not include stats when no time provided', () => {
      const result = buildCleanResult('/file.md');

      expect(result.stats).toBeUndefined();
    });
  });

  describe('mergeLintResults', () => {
    it('should throw on empty array', () => {
      expect(() => mergeLintResults([])).toThrow('Cannot merge empty results array');
    });

    it('should return single result unchanged', () => {
      const single: LintResult = {
        filePath: '/file.md',
        messages: [{ ruleId: 'r1', severity: 'error', message: 'E1' }],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      expect(mergeLintResults([single])).toBe(single);
    });

    it('should throw when merging results for different files', () => {
      const r1: LintResult = {
        filePath: '/file1.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };
      const r2: LintResult = {
        filePath: '/file2.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      expect(() => mergeLintResults([r1, r2])).toThrow('Cannot merge results for different files');
    });

    it('should merge counts and messages from multiple results', () => {
      const r1: LintResult = {
        filePath: '/file.md',
        messages: [{ ruleId: 'r1', severity: 'error', message: 'E1' }],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 0,
        fixableErrorCount: 1,
        fixableWarningCount: 0,
      };
      const r2: LintResult = {
        filePath: '/file.md',
        messages: [{ ruleId: 'r2', severity: 'warning', message: 'W1' }],
        suppressedMessages: [{ ruleId: 'r3', severity: 'error', message: 'Suppressed' }],
        errorCount: 0,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 1,
      };

      const merged = mergeLintResults([r1, r2]);

      expect(merged.filePath).toBe('/file.md');
      expect(merged.messages).toHaveLength(2);
      expect(merged.suppressedMessages).toHaveLength(1);
      expect(merged.errorCount).toBe(1);
      expect(merged.warningCount).toBe(1);
      expect(merged.fixableErrorCount).toBe(1);
      expect(merged.fixableWarningCount).toBe(1);
    });

    it('should merge validation times', () => {
      const r1: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        stats: { validationTime: 20 },
      };
      const r2: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        stats: { validationTime: 30 },
      };

      const merged = mergeLintResults([r1, r2]);

      expect(merged.stats).toEqual({ validationTime: 50 });
    });

    it('should deduplicate deprecated rules', () => {
      const r1: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          { ruleId: 'commands-deprecated-directory', reason: 'Use skills' },
        ],
      };
      const r2: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        deprecatedRulesUsed: [
          { ruleId: 'commands-deprecated-directory', reason: 'Use skills' },
        ],
      };

      const merged = mergeLintResults([r1, r2]);

      expect(merged.deprecatedRulesUsed).toHaveLength(1);
    });

    it('should use source/output from last result', () => {
      const r1: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        source: 'original',
      };
      const r2: LintResult = {
        filePath: '/file.md',
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        source: 'latest',
        output: 'fixed',
      };

      const merged = mergeLintResults([r1, r2]);

      expect(merged.source).toBe('latest');
      expect(merged.output).toBe('fixed');
    });
  });

  describe('sortLintResult', () => {
    it('should sort messages by line number', () => {
      const result: LintResult = {
        filePath: '/file.md',
        messages: [
          { ruleId: 'r1', severity: 'error', message: 'Line 10', line: 10 },
          { ruleId: 'r2', severity: 'error', message: 'Line 1', line: 1 },
          { ruleId: 'r3', severity: 'error', message: 'Line 5', line: 5 },
        ],
        suppressedMessages: [],
        errorCount: 3,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      const sorted = sortLintResult(result);

      expect(sorted.messages[0].line).toBe(1);
      expect(sorted.messages[1].line).toBe(5);
      expect(sorted.messages[2].line).toBe(10);
    });

    it('should sort by column within same line', () => {
      const result: LintResult = {
        filePath: '/file.md',
        messages: [
          { ruleId: 'r1', severity: 'error', message: 'Col 20', line: 5, column: 20 },
          { ruleId: 'r2', severity: 'error', message: 'Col 5', line: 5, column: 5 },
        ],
        suppressedMessages: [],
        errorCount: 2,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      const sorted = sortLintResult(result);

      expect(sorted.messages[0].column).toBe(5);
      expect(sorted.messages[1].column).toBe(20);
    });

    it('should sort errors before warnings at same position', () => {
      const result: LintResult = {
        filePath: '/file.md',
        messages: [
          { ruleId: 'r1', severity: 'warning', message: 'Warning', line: 5 },
          { ruleId: 'r2', severity: 'error', message: 'Error', line: 5 },
        ],
        suppressedMessages: [],
        errorCount: 1,
        warningCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      const sorted = sortLintResult(result);

      expect(sorted.messages[0].severity).toBe('error');
      expect(sorted.messages[1].severity).toBe('warning');
    });

    it('should not mutate the original result', () => {
      const result: LintResult = {
        filePath: '/file.md',
        messages: [
          { ruleId: 'r1', severity: 'error', message: 'B', line: 10 },
          { ruleId: 'r2', severity: 'error', message: 'A', line: 1 },
        ],
        suppressedMessages: [],
        errorCount: 2,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };

      const sorted = sortLintResult(result);

      expect(result.messages[0].line).toBe(10);
      expect(sorted.messages[0].line).toBe(1);
    });
  });
});
