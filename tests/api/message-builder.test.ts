import {
  buildLintMessage,
  createFileReadError,
  createParseError,
  createConfigError,
  createInternalError,
  createIgnoredFileWarning,
  filterBySeverity,
  isFixable,
  groupByRule,
} from '../../src/api/message-builder';
import { ValidationError, ValidationWarning } from '../../src/validators/file-validator';
import { LintMessage } from '../../src/api/types';

describe('message-builder', () => {
  describe('buildLintMessage', () => {
    it('should build a basic error message', () => {
      const error: ValidationError = {
        message: 'File exceeds size limit',
        severity: 'error',
      };

      const result = buildLintMessage(error, 'error');

      expect(result.severity).toBe('error');
      expect(result.message).toBe('File exceeds size limit');
      expect(result.ruleId).toBeNull();
    });

    it('should include ruleId when present', () => {
      const error: ValidationError = {
        message: 'Too large',
        severity: 'error',
        ruleId: 'claude-md-size-error',
      };

      const result = buildLintMessage(error, 'error');

      expect(result.ruleId).toBe('claude-md-size-error');
    });

    it('should include line when present', () => {
      const error: ValidationError = {
        message: 'Bad line',
        severity: 'error',
        line: 42,
      };

      const result = buildLintMessage(error, 'error');

      expect(result.line).toBe(42);
    });

    it('should include column when present', () => {
      const error = {
        message: 'Bad column',
        severity: 'error' as const,
        column: 10,
      };

      const result = buildLintMessage(error, 'error');

      expect(result.column).toBe(10);
    });

    it('should include explanation and howToFix', () => {
      const warning: ValidationWarning = {
        message: 'Consider fixing',
        severity: 'warning',
        explanation: 'This matters because...',
        howToFix: 'Do this instead',
      };

      const result = buildLintMessage(warning, 'warning');

      expect(result.explanation).toBe('This matters because...');
      expect(result.howToFix).toBe('Do this instead');
    });

    it('should convert autoFix to fix info', () => {
      const error: ValidationError = {
        message: 'Fixable issue',
        severity: 'error',
        autoFix: {
          ruleId: 'claude-md-size-error',
          description: 'Fix it',
          filePath: '/test.md',
          apply: (content: string) => content,
        },
      };

      const result = buildLintMessage(error, 'error');

      expect(result.fix).toBeDefined();
      expect(result.fix!.range).toEqual([0, 0]);
      expect(result.fix!.text).toBe('');
    });

    it('should build a warning message', () => {
      const warning: ValidationWarning = {
        message: 'Minor issue',
        severity: 'warning',
      };

      const result = buildLintMessage(warning, 'warning');

      expect(result.severity).toBe('warning');
    });
  });

  describe('createFileReadError', () => {
    it('should create a file read error message', () => {
      const error = new Error('ENOENT: no such file');
      const result = createFileReadError('/path/to/file.md', error);

      expect(result.severity).toBe('error');
      expect(result.ruleId).toBeNull();
      expect(result.message).toContain('Failed to read file');
      expect(result.message).toContain('ENOENT');
      expect(result.explanation).toContain('/path/to/file.md');
      expect(result.line).toBe(1);
    });
  });

  describe('createParseError', () => {
    it('should create a parse error message', () => {
      const error = new Error('Unexpected token');
      const result = createParseError('/path/to/file.json', error);

      expect(result.severity).toBe('error');
      expect(result.message).toContain('Parse error');
      expect(result.message).toContain('Unexpected token');
      expect(result.explanation).toContain('/path/to/file.json');
      expect(result.line).toBe(1);
    });

    it('should use provided line number', () => {
      const error = new Error('Unexpected token');
      const result = createParseError('/file.json', error, 5);

      expect(result.line).toBe(5);
    });
  });

  describe('createConfigError', () => {
    it('should create a config error with file path', () => {
      const result = createConfigError('Invalid rule', '.claudelintrc.json');

      expect(result.severity).toBe('error');
      expect(result.message).toContain('Configuration error');
      expect(result.message).toContain('Invalid rule');
      expect(result.explanation).toContain('.claudelintrc.json');
    });

    it('should create a config error without file path', () => {
      const result = createConfigError('Invalid rule');

      expect(result.explanation).toContain('Invalid configuration');
      expect(result.explanation).not.toContain('undefined');
    });
  });

  describe('createInternalError', () => {
    it('should create an internal error with ruleId', () => {
      const error = new Error('Something broke');
      const result = createInternalError(error, '/file.md', 'claude-md-size-error');

      expect(result.severity).toBe('error');
      expect(result.ruleId).toBe('claude-md-size-error');
      expect(result.message).toContain('Internal error');
      expect(result.explanation).toContain('/file.md');
    });

    it('should create an internal error without ruleId', () => {
      const error = new Error('Something broke');
      const result = createInternalError(error, '/file.md');

      expect(result.ruleId).toBeNull();
    });
  });

  describe('createIgnoredFileWarning', () => {
    it('should create an ignored file warning', () => {
      const result = createIgnoredFileWarning('/path/to/ignored.md');

      expect(result.severity).toBe('warning');
      expect(result.message).toContain('ignored');
      expect(result.explanation).toContain('/path/to/ignored.md');
    });
  });

  describe('filterBySeverity', () => {
    const messages: LintMessage[] = [
      { ruleId: 'r1', severity: 'error', message: 'Error 1' },
      { ruleId: 'r2', severity: 'warning', message: 'Warning 1' },
      { ruleId: 'r3', severity: 'error', message: 'Error 2' },
    ];

    it('should filter errors', () => {
      const errors = filterBySeverity(messages, 'error');
      expect(errors).toHaveLength(2);
      expect(errors.every((m) => m.severity === 'error')).toBe(true);
    });

    it('should filter warnings', () => {
      const warnings = filterBySeverity(messages, 'warning');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].message).toBe('Warning 1');
    });
  });

  describe('isFixable', () => {
    it('should return true when fix is present', () => {
      const msg: LintMessage = {
        ruleId: 'r1',
        severity: 'error',
        message: 'test',
        fix: { range: [0, 5], text: 'fixed' },
      };
      expect(isFixable(msg)).toBe(true);
    });

    it('should return true when suggestions are present', () => {
      const msg: LintMessage = {
        ruleId: 'r1',
        severity: 'error',
        message: 'test',
        suggestions: [{ desc: 'Fix it', fix: { range: [0, 5], text: 'fixed' } }],
      };
      expect(isFixable(msg)).toBe(true);
    });

    it('should return false when neither fix nor suggestions', () => {
      const msg: LintMessage = {
        ruleId: 'r1',
        severity: 'error',
        message: 'test',
      };
      expect(isFixable(msg)).toBe(false);
    });
  });

  describe('groupByRule', () => {
    it('should group messages by ruleId', () => {
      const messages: LintMessage[] = [
        { ruleId: 'rule-a', severity: 'error', message: 'Error 1' },
        { ruleId: 'rule-b', severity: 'warning', message: 'Warning 1' },
        { ruleId: 'rule-a', severity: 'error', message: 'Error 2' },
      ];

      const grouped = groupByRule(messages);

      expect(grouped.get('rule-a')).toHaveLength(2);
      expect(grouped.get('rule-b')).toHaveLength(1);
    });

    it('should use "no-rule" for null ruleId', () => {
      const messages: LintMessage[] = [
        { ruleId: null, severity: 'error', message: 'No rule' },
      ];

      const grouped = groupByRule(messages);

      expect(grouped.get('no-rule')).toHaveLength(1);
    });
  });
});
