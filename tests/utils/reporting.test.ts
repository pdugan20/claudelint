import { Reporter } from '../../src/utils/reporting/reporting';
import { ValidationResult } from '../../src/validators/file-validator';

describe('Reporter', () => {
  let reporter: Reporter;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Stylish format (default)', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false });
    });

    it('should report validation result with errors', () => {
      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            file: 'test.md',
            line: 10,
            severity: 'error',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // ESLint-style file grouping: file header with count, then indented issue
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test.md'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1 error'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });

    it('should report validation result with warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [
          {
            message: 'Test warning',
            file: 'test.md',
            severity: 'warning',
          },
        ],
        valid: true,
      };

      reporter.report(result, 'Test');

      // ESLint-style file grouping: file header with count, then indented issue
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('test.md'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1 warning'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test warning'));
    });

    it('should report success when no errors or warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [],
        valid: true,
      };

      reporter.report(result, 'Test');

      // Status messages go to stderr
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('✓ All checks passed!'));
    });

    it('should show explanations when explain flag is set', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            severity: 'error',
            ruleId: 'claude-md-size',
            explanation: 'This is why it matters',
            howToFix: 'This is how to fix it',
            fix: 'Apply this fix',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // All output goes to console.log with Tier 2 labels
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Why:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('This is why it matters'));
      // Fix: uses issue.fix (rule-specific) over issue.howToFix (docs fallback)
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Fix:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Apply this fix'));
    });

    it('should use howToFix as Fix: fallback when no issue.fix', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            severity: 'error',
            ruleId: 'claude-md-size',
            howToFix: 'General fix instructions',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('Fix:');
      expect(allOutput).toContain('General fix instructions');
    });

    it('should omit Why: line when no explanation available', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            severity: 'error',
            ruleId: 'claude-md-size',
            fix: 'Apply this fix',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).not.toContain('Why:');
      expect(allOutput).toContain('Fix:');
    });

    it('should omit Fix: line when no fix or howToFix available', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            severity: 'error',
            ruleId: 'claude-md-size',
            explanation: 'This is why it matters',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('Why:');
      expect(allOutput).not.toContain('Fix:');
    });
  });

  describe('Compact format', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'compact', color: false });
    });

    it('should report errors in compact format', () => {
      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            file: 'test.md',
            line: 10,
            severity: 'error',
            ruleId: 'claude-md-size',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Compact format: file:line:0: error: message [rule-id]
      expect(consoleLogSpy).toHaveBeenCalledWith('test.md:10:0: error: Test error [claude-md-size]');
    });

    it('should report warnings in compact format', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [
          {
            message: 'Test warning',
            file: 'test.md',
            line: 5,
            severity: 'warning',
            ruleId: 'claude-md-size',
          },
        ],
        valid: true,
      };

      reporter.report(result, 'Test');

      // Compact format: file:line:0: warning: message [rule-id]
      expect(consoleLogSpy).toHaveBeenCalledWith('test.md:5:0: warning: Test warning [claude-md-size]');
    });
  });

  describe('JSON format', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'json', color: false });
    });

    it('should store results for JSON output', () => {
      const result: ValidationResult = {
        errors: [{ message: 'Error 1', severity: 'error' }],
        warnings: [{ message: 'Warning 1', severity: 'warning' }],
        valid: false,
      };

      reporter.report(result, 'Test');

      // JSON output happens in reportAllJSON, not in report()
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should output all results as JSON', () => {
      const result1: ValidationResult = {
        errors: [{ message: 'Error 1', severity: 'error', ruleId: 'claude-md-size' }],
        warnings: [],
        valid: false,
      };

      const result2: ValidationResult = {
        errors: [],
        warnings: [{ message: 'Warning 1', severity: 'warning', ruleId: 'claude-md-size' }],
        valid: true,
      };

      reporter.report(result1, 'Test1');
      reporter.report(result2, 'Test2');
      reporter.reportAllJSON();

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const jsonOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(jsonOutput);

      expect(parsed).toHaveProperty('valid');
      expect(parsed).toHaveProperty('errorCount');
      expect(parsed).toHaveProperty('warningCount');
      expect(parsed).toHaveProperty('validators');
      expect(parsed.validators).toHaveLength(2);
      expect(parsed.validators[0].name).toBe('Test1');
      expect(parsed.validators[0].errors).toHaveLength(1);
      expect(parsed.validators[1].name).toBe('Test2');
      expect(parsed.validators[1].warnings).toHaveLength(1);
    });
  });

  describe('Color support', () => {
    it('should not use colors when color is disabled', () => {
      reporter = new Reporter({ format: 'stylish', color: false });

      const result: ValidationResult = {
        errors: [{ message: 'Test error', severity: 'error' }],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const logCalls = consoleLogSpy.mock.calls.flat().join('');
      expect(logCalls).not.toMatch(/\u001b\[\d+m/); // No ANSI color codes
    });
  });

  describe('Section headers', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false, verbose: true });
    });

    it('should print section headers', () => {
      reporter.section('Test Section');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test Section'));
    });
  });

  describe('Exit codes', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish' });
    });

    it('should return exit code 0 for no errors or warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [],
        valid: true,
      };

      expect(reporter.getExitCode(result)).toBe(0);
    });

    it('should return exit code 1 for errors', () => {
      const result: ValidationResult = {
        errors: [{ message: 'Error', severity: 'error' }],
        warnings: [],
        valid: false,
      };

      expect(reporter.getExitCode(result)).toBe(1);
    });

    it('should return exit code 1 for warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [{ message: 'Warning', severity: 'warning' }],
        valid: true,
      };

      expect(reporter.getExitCode(result)).toBe(1);
    });

    it('should return exit code 1 for warnings when warningsAsErrors is true', () => {
      reporter = new Reporter({ warningsAsErrors: true });

      const result: ValidationResult = {
        errors: [],
        warnings: [{ message: 'Warning', severity: 'warning' }],
        valid: true,
      };

      expect(reporter.getExitCode(result)).toBe(1);
    });
  });

  describe('Verbose mode', () => {
    it('should show additional details in verbose mode', () => {
      reporter = new Reporter({ format: 'stylish', color: false, verbose: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            file: 'test.md',
            line: 10,
            severity: 'error',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Verbose mode should still show the standard output
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });
  });

  describe('Multiple errors and warnings', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false });
    });

    it('should report multiple errors', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', severity: 'error', ruleId: 'claude-md-size' },
          { message: 'Error 2', severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 3', severity: 'error', ruleId: 'claude-md-import-circular' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error 1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error 2'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error 3'));
    });

    it('should report both errors and warnings', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', severity: 'error' },
          { message: 'Error 2', severity: 'error' },
        ],
        warnings: [
          { message: 'Warning 1', severity: 'warning' },
          { message: 'Warning 2', severity: 'warning' },
          { message: 'Warning 3', severity: 'warning' },
        ],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error 1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Error 2'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning 1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning 2'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Warning 3'));
    });
  });

  describe('text-table formatting', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false });
    });

    it('should align columns consistently with text-table', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Short message', file: '/test/file.md', line: 5, severity: 'error', ruleId: 'claude-md-size' },
          { message: 'A longer message with more text', file: '/test/file.md', line: 100, severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Both lines should contain the rule ID (text-table aligns them)
      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('claude-md-size');
      // Line numbers should be right-aligned (100 pushes the column wider than 5)
      expect(allOutput).toMatch(/\s+5\s+error/);
      expect(allOutput).toMatch(/100\s+error/);
    });

    it('should handle mixed line-number and no-line-number issues in same file', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Has line', file: '/test/file.md', line: 10, severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [
          { message: 'No line', file: '/test/file.md', severity: 'warning', ruleId: 'claude-md-size' },
        ],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('Has line');
      expect(allOutput).toContain('No line');
      // Both should have rule IDs aligned
      expect(allOutput).toContain('claude-md-size');
    });

    it('should truncate long messages at 80 characters', () => {
      const longMessage = 'A'.repeat(100);
      const result: ValidationResult = {
        errors: [
          { message: longMessage, file: '/test/file.md', severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      // Should be truncated with "..."
      expect(allOutput).toContain('...');
      // Should NOT contain the full 100-char message
      expect(allOutput).not.toContain(longMessage);
    });

    it('should not truncate messages under 80 characters', () => {
      const shortMessage = 'This is a short message';
      const result: ValidationResult = {
        errors: [
          { message: shortMessage, file: '/test/file.md', severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain(shortMessage);
    });

    it('should align collapse lines as table rows', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', file: '/test/file.md', line: 1, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 2', file: '/test/file.md', line: 2, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 3', file: '/test/file.md', line: 3, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 4', file: '/test/file.md', line: 4, severity: 'error', ruleId: 'claude-md-import-missing' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      // First 2 shown individually
      expect(allOutput).toContain('Error 1');
      expect(allOutput).toContain('Error 2');
      // Remaining collapsed
      expect(allOutput).toContain('... and 2 more claude-md-import-missing');
      // 3rd and 4th not shown individually
      expect(allOutput).not.toContain('Error 3');
      expect(allOutput).not.toContain('Error 4');
    });

    it('should deduplicate identical issues', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Same error', file: '/test/file.md', line: 5, severity: 'error', ruleId: 'claude-md-size' },
          { message: 'Same error', file: '/test/file.md', line: 5, severity: 'error', ruleId: 'claude-md-size' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      // Should only appear once
      const matches = allOutput.match(/Same error/g);
      expect(matches).toHaveLength(1);
    });

    it('should not show Fix: labels in default output', () => {
      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            file: '/test/file.md',
            severity: 'error',
            ruleId: 'claude-md-size',
            fix: 'Do something different',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('Test error');
      expect(allOutput).not.toContain('Fix:');
    });

    it('should show Fix: labels in explain mode', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            file: '/test/file.md',
            severity: 'error',
            ruleId: 'claude-md-size',
            fix: 'Do something different',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      expect(allOutput).toContain('Fix:');
      expect(allOutput).toContain('Do something different');
    });
  });

  describe('getExplainFooter', () => {
    it('should return footer hint when explain mode is enabled', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });
      const footer = reporter.getExplainFooter();
      expect(footer).toBe("Run 'claudelint explain <rule-id>' for detailed rule documentation.");
    });

    it('should return null when explain mode is not enabled', () => {
      reporter = new Reporter({ format: 'stylish', color: false });
      expect(reporter.getExplainFooter()).toBeNull();
    });
  });

  describe('reportParallelResults quiet success', () => {
    it('should suppress per-validator output for clean validators in non-verbose mode', () => {
      reporter = new Reporter({ format: 'stylish', color: false });

      const results = [
        {
          name: 'Clean Validator',
          result: { errors: [], warnings: [], valid: true } as ValidationResult,
          duration: 10,
        },
        {
          name: 'Also Clean',
          result: { errors: [], warnings: [], valid: true } as ValidationResult,
          duration: 5,
        },
      ];

      reporter.reportParallelResults(results);

      // No per-validator output for clean validators
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Clean Validator')
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Also Clean')
      );
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('All checks passed')
      );
    });

    it('should show per-validator output for validators with issues', () => {
      reporter = new Reporter({ format: 'stylish', color: false });

      const results = [
        {
          name: 'Clean Validator',
          result: { errors: [], warnings: [], valid: true } as ValidationResult,
          duration: 10,
        },
        {
          name: 'Broken Validator',
          result: {
            errors: [{ message: 'Something broke', severity: 'error' as const }],
            warnings: [],
            valid: false,
          } as ValidationResult,
          duration: 20,
        },
      ];

      reporter.reportParallelResults(results);

      // Clean validator suppressed
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Clean Validator')
      );
      // Broken validator shown
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Broken Validator')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Something broke')
      );
    });

    it('should suppress clean validators in verbose mode (component status shown separately)', () => {
      reporter = new Reporter({ format: 'stylish', color: false, verbose: true });

      const results = [
        {
          name: 'Clean Validator',
          result: { errors: [], warnings: [], valid: true } as ValidationResult,
          duration: 10,
        },
        {
          name: 'Also Clean',
          result: { errors: [], warnings: [], valid: true } as ValidationResult,
          duration: 5,
        },
      ];

      reporter.reportParallelResults(results);

      // Clean validators should NOT produce per-validator output
      // (component status and file listings are rendered by check-all, not reporter)
      const allCalls = consoleErrorSpy.mock.calls.flat().join('\n');
      expect(allCalls).not.toContain('Clean Validator');
      expect(allCalls).not.toContain('Also Clean');
    });

    it('should show validators with issues in per-validator output', () => {
      reporter = new Reporter({ format: 'stylish', color: false, verbose: true });

      const results = [
        {
          name: 'Validator With Error',
          result: {
            errors: [{ message: 'Something broke', severity: 'error' as const }],
            warnings: [],
            valid: false,
          } as ValidationResult,
          duration: 3,
        },
      ];

      reporter.reportParallelResults(results);

      // Validators with issues are shown
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validator With Error')
      );
    });
  });

  describe('--quiet mode', () => {
    it('should suppress individual warning output in stylish format', () => {
      reporter = new Reporter({ format: 'stylish', color: false, quiet: true });

      const result: ValidationResult = {
        errors: [{ message: 'Real error', severity: 'error' }],
        warnings: [{ message: 'Noisy warning', severity: 'warning' }],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Errors still shown
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Real error'));
      // Warnings suppressed
      const allLogCalls = consoleLogSpy.mock.calls.flat().join(' ');
      expect(allLogCalls).not.toContain('Noisy warning');
    });

    it('should suppress individual warning output in compact format', () => {
      reporter = new Reporter({ format: 'compact', color: false, quiet: true });

      const result: ValidationResult = {
        errors: [{ message: 'Real error', file: 'a.md', line: 1, severity: 'error', ruleId: 'claude-md-size' }],
        warnings: [{ message: 'Noisy warning', file: 'b.md', line: 2, severity: 'warning', ruleId: 'claude-md-size' }],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Errors still shown
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Real error'));
      // Warnings suppressed
      const allLogCalls = consoleLogSpy.mock.calls.flat().join(' ');
      expect(allLogCalls).not.toContain('Noisy warning');
    });

    it('should suppress warning-only validators in parallel results', () => {
      reporter = new Reporter({ format: 'stylish', color: false, quiet: true });

      const results = [
        {
          name: 'Warning Only',
          result: {
            errors: [],
            warnings: [{ message: 'Just a warning', severity: 'warning' as const }],
            valid: true,
          } as ValidationResult,
          duration: 10,
        },
        {
          name: 'Has Errors',
          result: {
            errors: [{ message: 'Bad stuff', severity: 'error' as const }],
            warnings: [],
            valid: false,
          } as ValidationResult,
          duration: 20,
        },
      ];

      reporter.reportParallelResults(results);

      // Warning-only validator suppressed (treated as clean in quiet mode)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Warning Only')
      );
      // Error validator shown
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Has Errors')
      );
    });

    it('should still show "All checks passed" for error-free validators with quiet report()', () => {
      reporter = new Reporter({ format: 'stylish', color: false, quiet: true });

      const result: ValidationResult = {
        errors: [],
        warnings: [{ message: 'Just a warning', severity: 'warning' }],
        valid: true,
      };

      reporter.report(result, 'Test');

      // In quiet mode with only warnings, totalIssues is 0 (errors only)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('All checks passed')
      );
    });
  });

  describe('--no-collapse (collapseRepetitive: false)', () => {
    it('should show all issues when collapseRepetitive is false', () => {
      const noCollapseReporter = new Reporter({ format: 'stylish', color: false, collapseRepetitive: false });
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', file: '/test/file.md', line: 1, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 2', file: '/test/file.md', line: 2, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 3', file: '/test/file.md', line: 3, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 4', file: '/test/file.md', line: 4, severity: 'error', ruleId: 'claude-md-import-missing' },
        ],
        warnings: [],
        valid: false,
      };

      noCollapseReporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      // All 4 errors shown individually
      expect(allOutput).toContain('Error 1');
      expect(allOutput).toContain('Error 2');
      expect(allOutput).toContain('Error 3');
      expect(allOutput).toContain('Error 4');
      // No collapse line
      expect(allOutput).not.toContain('... and');
    });

    it('should collapse by default (collapseRepetitive not set)', () => {
      const defaultReporter = new Reporter({ format: 'stylish', color: false });
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', file: '/test/file.md', line: 1, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 2', file: '/test/file.md', line: 2, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 3', file: '/test/file.md', line: 3, severity: 'error', ruleId: 'claude-md-import-missing' },
          { message: 'Error 4', file: '/test/file.md', line: 4, severity: 'error', ruleId: 'claude-md-import-missing' },
        ],
        warnings: [],
        valid: false,
      };

      defaultReporter.report(result, 'Test');

      const allOutput = consoleLogSpy.mock.calls.flat().join('\n');
      // First 2 shown, rest collapsed
      expect(allOutput).toContain('Error 1');
      expect(allOutput).toContain('Error 2');
      expect(allOutput).toContain('... and 2 more claude-md-import-missing');
      expect(allOutput).not.toContain('Error 3');
      expect(allOutput).not.toContain('Error 4');
    });
  });
});
