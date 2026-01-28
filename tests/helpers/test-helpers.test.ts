import {
  getErrorMessages,
  getWarningMessages,
  hasError,
  hasWarning,
  getErrorsForFile,
  getWarningsForFile,
  getErrorsWithRule,
  getWarningsWithRule,
  assertAllErrorsHaveRuleId,
  assertAllWarningsHaveRuleId,
  createMockResult,
} from './test-helpers';

describe('Test Helpers', () => {
  describe('getErrorMessages', () => {
    it('should extract all error messages', () => {
      const result = createMockResult({
        errors: [{ message: 'Error 1' }, { message: 'Error 2' }, { message: 'Error 3' }],
      });

      const messages = getErrorMessages(result);

      expect(messages).toEqual(['Error 1', 'Error 2', 'Error 3']);
    });

    it('should return empty array when no errors', () => {
      const result = createMockResult({ errors: [] });

      const messages = getErrorMessages(result);

      expect(messages).toEqual([]);
    });
  });

  describe('getWarningMessages', () => {
    it('should extract all warning messages', () => {
      const result = createMockResult({
        warnings: [{ message: 'Warning 1' }, { message: 'Warning 2' }],
      });

      const messages = getWarningMessages(result);

      expect(messages).toEqual(['Warning 1', 'Warning 2']);
    });

    it('should return empty array when no warnings', () => {
      const result = createMockResult({ warnings: [] });

      const messages = getWarningMessages(result);

      expect(messages).toEqual([]);
    });
  });

  describe('hasError', () => {
    it('should return true when error message is found (string)', () => {
      const result = createMockResult({
        errors: [{ message: 'File not found' }, { message: 'Invalid syntax' }],
      });

      expect(hasError(result, 'File not found')).toBe(true);
      expect(hasError(result, 'not found')).toBe(true);
      expect(hasError(result, 'Invalid')).toBe(true);
    });

    it('should return true when error message matches regex', () => {
      const result = createMockResult({
        errors: [{ message: 'Expected 5 items but got 3' }],
      });

      expect(hasError(result, /Expected \d+ items/)).toBe(true);
      expect(hasError(result, /but got \d+/)).toBe(true);
    });

    it('should return false when error message is not found', () => {
      const result = createMockResult({
        errors: [{ message: 'File not found' }],
      });

      expect(hasError(result, 'Different error')).toBe(false);
      expect(hasError(result, /Different/)).toBe(false);
    });

    it('should return false when there are no errors', () => {
      const result = createMockResult({ errors: [] });

      expect(hasError(result, 'Any error')).toBe(false);
    });
  });

  describe('hasWarning', () => {
    it('should return true when warning message is found (string)', () => {
      const result = createMockResult({
        warnings: [{ message: 'Deprecated feature' }, { message: 'Missing field' }],
      });

      expect(hasWarning(result, 'Deprecated')).toBe(true);
      expect(hasWarning(result, 'Missing')).toBe(true);
    });

    it('should return true when warning message matches regex', () => {
      const result = createMockResult({
        warnings: [{ message: 'File size: 35KB' }],
      });

      expect(hasWarning(result, /File size: \d+KB/)).toBe(true);
    });

    it('should return false when warning message is not found', () => {
      const result = createMockResult({
        warnings: [{ message: 'Some warning' }],
      });

      expect(hasWarning(result, 'Different warning')).toBe(false);
    });
  });

  describe('getErrorsForFile', () => {
    it('should return errors for specific file', () => {
      const result = createMockResult({
        errors: [
          { message: 'Error 1', file: 'file1.ts' },
          { message: 'Error 2', file: 'file2.ts' },
          { message: 'Error 3', file: 'file1.ts' },
        ],
      });

      const file1Errors = getErrorsForFile(result, 'file1.ts');
      const file2Errors = getErrorsForFile(result, 'file2.ts');

      expect(file1Errors).toHaveLength(2);
      expect(file1Errors[0].message).toBe('Error 1');
      expect(file1Errors[1].message).toBe('Error 3');
      expect(file2Errors).toHaveLength(1);
      expect(file2Errors[0].message).toBe('Error 2');
    });

    it('should return empty array when no errors for file', () => {
      const result = createMockResult({
        errors: [{ message: 'Error 1', file: 'file1.ts' }],
      });

      const errors = getErrorsForFile(result, 'file2.ts');

      expect(errors).toEqual([]);
    });
  });

  describe('getWarningsForFile', () => {
    it('should return warnings for specific file', () => {
      const result = createMockResult({
        warnings: [
          { message: 'Warning 1', file: 'file1.ts' },
          { message: 'Warning 2', file: 'file2.ts' },
        ],
      });

      const warnings = getWarningsForFile(result, 'file1.ts');

      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe('Warning 1');
    });

    it('should return empty array when no warnings for file', () => {
      const result = createMockResult({ warnings: [] });

      const warnings = getWarningsForFile(result, 'file1.ts');

      expect(warnings).toEqual([]);
    });
  });

  describe('getErrorsWithRule', () => {
    it('should return errors with specific rule ID', () => {
      const result = createMockResult({
        errors: [
          { message: 'Error 1', ruleId: 'size-error' },
          { message: 'Error 2', ruleId: 'syntax-error' },
          { message: 'Error 3', ruleId: 'size-error' },
        ],
      });

      const sizeErrors = getErrorsWithRule(result, 'size-error');
      const syntaxErrors = getErrorsWithRule(result, 'syntax-error');

      expect(sizeErrors).toHaveLength(2);
      expect(syntaxErrors).toHaveLength(1);
    });

    it('should return empty array when no errors with rule ID', () => {
      const result = createMockResult({
        errors: [{ message: 'Error 1', ruleId: 'size-error' }],
      });

      const errors = getErrorsWithRule(result, 'other-rule');

      expect(errors).toEqual([]);
    });
  });

  describe('getWarningsWithRule', () => {
    it('should return warnings with specific rule ID', () => {
      const result = createMockResult({
        warnings: [
          { message: 'Warning 1', ruleId: 'size-warning' },
          { message: 'Warning 2', ruleId: 'deprecated-warning' },
        ],
      });

      const warnings = getWarningsWithRule(result, 'size-warning');

      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe('Warning 1');
    });
  });

  describe('assertAllErrorsHaveRuleId', () => {
    it('should not throw when all errors have rule ID', () => {
      const result = createMockResult({
        errors: [{ message: 'Error 1', ruleId: 'rule-1' }, { message: 'Error 2', ruleId: 'rule-2' }],
      });

      expect(() => assertAllErrorsHaveRuleId(result)).not.toThrow();
    });

    it('should throw when some errors are missing rule ID', () => {
      const result = createMockResult({
        errors: [{ message: 'Error 1', ruleId: 'rule-1' }, { message: 'Error 2' }],
      });

      expect(() => assertAllErrorsHaveRuleId(result)).toThrow(/without rule ID/);
    });

    it('should not throw when there are no errors', () => {
      const result = createMockResult({ errors: [] });

      expect(() => assertAllErrorsHaveRuleId(result)).not.toThrow();
    });
  });

  describe('assertAllWarningsHaveRuleId', () => {
    it('should not throw when all warnings have rule ID', () => {
      const result = createMockResult({
        warnings: [
          { message: 'Warning 1', ruleId: 'rule-1' },
          { message: 'Warning 2', ruleId: 'rule-2' },
        ],
      });

      expect(() => assertAllWarningsHaveRuleId(result)).not.toThrow();
    });

    it('should throw when some warnings are missing rule ID', () => {
      const result = createMockResult({
        warnings: [{ message: 'Warning 1', ruleId: 'rule-1' }, { message: 'Warning 2' }],
      });

      expect(() => assertAllWarningsHaveRuleId(result)).toThrow(/without rule ID/);
    });
  });

  describe('createMockResult', () => {
    it('should create valid result by default', () => {
      const result = createMockResult();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should create result with errors', () => {
      const result = createMockResult({
        valid: false,
        errors: [{ message: 'Error 1', file: 'test.ts', line: 10, ruleId: 'test-rule' }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Error 1');
      expect(result.errors[0].file).toBe('test.ts');
      expect(result.errors[0].line).toBe(10);
      expect(result.errors[0].ruleId).toBe('test-rule');
      expect(result.errors[0].severity).toBe('error');
    });

    it('should create result with warnings', () => {
      const result = createMockResult({
        warnings: [{ message: 'Warning 1' }],
      });

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toBe('Warning 1');
      expect(result.warnings[0].severity).toBe('warning');
    });
  });
});
