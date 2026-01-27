import { Reporter } from '../../src/utils/reporting';
import { ValidationResult } from '../../src/validators/base';

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
            ruleId: 'test-rule',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith('\nTest Validation Results:\n');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('✗ Error: Test error'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('at: test.md:10'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1 error'));
    });

    it('should report validation result with warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [
          {
            message: 'Test warning',
            file: 'test.md',
            severity: 'warning',
            ruleId: 'test-rule',
          },
        ],
        valid: true,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('! Warning: Test warning'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('1 warning'));
    });

    it('should report success when no errors or warnings', () => {
      const result: ValidationResult = {
        errors: [],
        warnings: [],
        valid: true,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓ All checks passed!'));
    });

    it('should show explanations when explain flag is set', () => {
      reporter = new Reporter({ format: 'stylish', color: false, explain: true });

      const result: ValidationResult = {
        errors: [
          {
            message: 'Test error',
            severity: 'error',
            ruleId: 'test-rule',
            explanation: 'This is why it matters',
            howToFix: 'This is how to fix it',
            fix: 'Apply this fix',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Why this matters:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('This is why it matters'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('How to fix:'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('This is how to fix it'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Fix: Apply this fix'));
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
            ruleId: 'test-rule',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/test\.md:10.*Error:.*Test error.*\[test-rule\]/));
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
            ruleId: 'test-rule',
          },
        ],
        valid: true,
      };

      reporter.report(result, 'Test');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringMatching(/test\.md:5.*Warning:.*Test warning.*\[test-rule\]/));
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
        errors: [{ message: 'Error 1', severity: 'error', ruleId: 'rule-1' }],
        warnings: [],
        valid: false,
      };

      const result2: ValidationResult = {
        errors: [],
        warnings: [{ message: 'Warning 1', severity: 'warning', ruleId: 'rule-2' }],
        valid: true,
      };

      reporter.report(result1, 'Test1');
      reporter.report(result2, 'Test2');
      reporter.reportAllJSON();

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const jsonOutput = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(jsonOutput);

      expect(parsed).toHaveProperty('Test1');
      expect(parsed).toHaveProperty('Test2');
      expect(parsed.Test1.errors).toHaveLength(1);
      expect(parsed.Test2.warnings).toHaveLength(1);
    });
  });

  describe('Color support', () => {
    it('should use colors when color is enabled', () => {
      reporter = new Reporter({ format: 'stylish', color: true });

      const result: ValidationResult = {
        errors: [{ message: 'Test error', severity: 'error' }],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Color codes should be present (ANSI escape codes)
      const errorCalls = consoleErrorSpy.mock.calls.flat().join('');
      expect(errorCalls).toMatch(/\u001b\[\d+m/); // ANSI color code pattern
    });

    it('should not use colors when color is disabled', () => {
      reporter = new Reporter({ format: 'stylish', color: false });

      const result: ValidationResult = {
        errors: [{ message: 'Test error', severity: 'error' }],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      const errorCalls = consoleErrorSpy.mock.calls.flat().join('');
      expect(errorCalls).not.toMatch(/\u001b\[\d+m/); // No ANSI color codes
    });
  });

  describe('Section headers', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false });
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
            ruleId: 'test-rule',
          },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      // Verbose mode should still show the standard output
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });
  });

  describe('Multiple errors and warnings', () => {
    beforeEach(() => {
      reporter = new Reporter({ format: 'stylish', color: false });
    });

    it('should report multiple errors', () => {
      const result: ValidationResult = {
        errors: [
          { message: 'Error 1', severity: 'error', ruleId: 'rule-1' },
          { message: 'Error 2', severity: 'error', ruleId: 'rule-2' },
          { message: 'Error 3', severity: 'error', ruleId: 'rule-3' },
        ],
        warnings: [],
        valid: false,
      };

      reporter.report(result, 'Test');

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error 1'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error 2'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error 3'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('3 errors'));
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

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('2 errors'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('3 warnings'));
    });
  });
});
