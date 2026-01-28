import { matchers } from './matchers';
import { ValidationResult } from '../../src/validators/base';

// Extend Jest with our custom matchers
expect.extend(matchers);

describe('Custom Matchers', () => {
  describe('toPassValidation', () => {
    it('should pass when validation is valid with no errors', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      expect(result).toPassValidation();
    });

    it('should fail when validation has errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error occurred', severity: 'error' }],
        warnings: [],
      };

      expect(() => expect(result).toPassValidation()).toThrow();
    });

    it('should pass when validation has warnings but no errors', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning occurred', severity: 'warning' }],
      };

      expect(result).toPassValidation();
    });
  });

  describe('toFailValidation', () => {
    it('should pass when validation has errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error occurred', severity: 'error' }],
        warnings: [],
      };

      expect(result).toFailValidation();
    });

    it('should fail when validation passed', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      expect(() => expect(result).toFailValidation()).toThrow();
    });
  });

  describe('toHaveError', () => {
    it('should pass when error message is found (string)', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { message: 'File not found', severity: 'error' },
          { message: 'Invalid syntax', severity: 'error' },
        ],
        warnings: [],
      };

      expect(result).toHaveError('File not found');
      expect(result).toHaveError('not found');
      expect(result).toHaveError('Invalid');
    });

    it('should pass when error message matches regex', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Expected 5 items but got 3', severity: 'error' }],
        warnings: [],
      };

      expect(result).toHaveError(/Expected \d+ items/);
      expect(result).toHaveError(/but got \d+/);
    });

    it('should fail when error message is not found', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'File not found', severity: 'error' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveError('Different error')).toThrow();
    });

    it('should fail when there are no errors', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      expect(() => expect(result).toHaveError('Any error')).toThrow();
    });
  });

  describe('toHaveWarning', () => {
    it('should pass when warning message is found (string)', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          { message: 'Deprecated feature used', severity: 'warning' },
          { message: 'Missing optional field', severity: 'warning' },
        ],
      };

      expect(result).toHaveWarning('Deprecated');
      expect(result).toHaveWarning('Missing optional');
    });

    it('should pass when warning message matches regex', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'File size: 35KB', severity: 'warning' }],
      };

      expect(result).toHaveWarning(/File size: \d+KB/);
    });

    it('should fail when warning message is not found', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'Some warning', severity: 'warning' }],
      };

      expect(() => expect(result).toHaveWarning('Different warning')).toThrow();
    });
  });

  describe('toHaveErrorCount', () => {
    it('should pass when error count matches', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { message: 'Error 1', severity: 'error' },
          { message: 'Error 2', severity: 'error' },
          { message: 'Error 3', severity: 'error' },
        ],
        warnings: [],
      };

      expect(result).toHaveErrorCount(3);
    });

    it('should pass when expecting zero errors', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      expect(result).toHaveErrorCount(0);
    });

    it('should fail when error count does not match', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error 1', severity: 'error' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveErrorCount(2)).toThrow();
    });
  });

  describe('toHaveWarningCount', () => {
    it('should pass when warning count matches', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          { message: 'Warning 1', severity: 'warning' },
          { message: 'Warning 2', severity: 'warning' },
        ],
      };

      expect(result).toHaveWarningCount(2);
    });

    it('should pass when expecting zero warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
      };

      expect(result).toHaveWarningCount(0);
    });

    it('should fail when warning count does not match', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning 1', severity: 'warning' }],
      };

      expect(() => expect(result).toHaveWarningCount(3)).toThrow();
    });
  });

  describe('toHaveErrorWithRule', () => {
    it('should pass when error with message and rule ID is found', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { message: 'File too large', severity: 'error', ruleId: 'size-error' },
          { message: 'Invalid syntax', severity: 'error', ruleId: 'import-missing' },
        ],
        warnings: [],
      };

      expect(result).toHaveErrorWithRule('File too large', 'size-error');
      expect(result).toHaveErrorWithRule('Invalid', 'import-missing');
    });

    it('should pass when error matches regex and rule ID', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Expected 5 items', severity: 'error', ruleId: 'skill-missing-examples' }],
        warnings: [],
      };

      expect(result).toHaveErrorWithRule(/Expected \d+ items/, 'skill-missing-examples');
    });

    it('should fail when message matches but rule ID does not', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'File too large', severity: 'error', ruleId: 'size-error' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveErrorWithRule('File too large', 'import-missing')).toThrow();
    });

    it('should fail when rule ID matches but message does not', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'File too large', severity: 'error', ruleId: 'size-error' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveErrorWithRule('Different message', 'size-error')).toThrow();
    });
  });

  describe('toHaveErrorInFile', () => {
    it('should pass when error is found in specified file', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [
          { message: 'Error 1', severity: 'error', file: 'file1.ts' },
          { message: 'Error 2', severity: 'error', file: 'file2.ts' },
        ],
        warnings: [],
      };

      expect(result).toHaveErrorInFile('file1.ts');
      expect(result).toHaveErrorInFile('file2.ts');
    });

    it('should fail when no errors in specified file', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error 1', severity: 'error', file: 'file1.ts' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveErrorInFile('file2.ts')).toThrow();
    });
  });

  describe('toHaveNoErrors', () => {
    it('should pass when there are no errors', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning', severity: 'warning' }],
      };

      expect(result).toHaveNoErrors();
    });

    it('should fail when there are errors', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error', severity: 'error' }],
        warnings: [],
      };

      expect(() => expect(result).toHaveNoErrors()).toThrow();
    });
  });

  describe('toHaveNoWarnings', () => {
    it('should pass when there are no warnings', () => {
      const result: ValidationResult = {
        valid: false,
        errors: [{ message: 'Error', severity: 'error' }],
        warnings: [],
      };

      expect(result).toHaveNoWarnings();
    });

    it('should fail when there are warnings', () => {
      const result: ValidationResult = {
        valid: true,
        errors: [],
        warnings: [{ message: 'Warning', severity: 'warning' }],
      };

      expect(() => expect(result).toHaveNoWarnings()).toThrow();
    });
  });
});
