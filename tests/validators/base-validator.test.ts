import { BaseValidator, ValidationResult } from '../../src/validators/base';
import { RuleRegistry } from '../../src/utils/rules/registry';
import { ClaudeLintConfig } from '../../src/utils/config/types';
import { RuleId } from '../../src/rules/rule-ids';
import { z } from 'zod';

// Create a minimal test validator for testing BaseValidator methods
class TestValidator extends BaseValidator {
  validate(): Promise<ValidationResult> {
    return Promise.resolve(this.getResult());
  }

  // Expose getResult for testing
  public override getResult(): ValidationResult {
    return super.getResult();
  }

  // Expose protected methods for testing
  public testSetCurrentFile(filePath: string): void {
    this.setCurrentFile(filePath);
  }

  public testIsRuleEnabledInConfig(ruleId: RuleId): boolean {
    return this.isRuleEnabledInConfig(ruleId);
  }

  public testGetRuleOptions<T>(ruleId: RuleId): T | undefined {
    return this.getRuleOptions<T>(ruleId);
  }

  public testReport(
    message: string,
    file?: string,
    line?: number,
    ruleId?: RuleId,
    options?: { fix?: string; explanation?: string; howToFix?: string }
  ): void {
    this.report(message, file, line, ruleId, options);
  }

  public testParseDisableComments(filePath: string, content: string): void {
    this.parseDisableComments(filePath, content);
  }
}

describe('BaseValidator config integration', () => {

  // Register test rules before all tests
  beforeAll(() => {
    RuleRegistry.clear();

    RuleRegistry.register({
      id: 'claude-md-size-error',
      name: 'Size Error',
      description: 'Test rule without options',
      category: 'CLAUDE.md',
      severity: 'error',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
    });

    RuleRegistry.register({
      id: 'claude-md-size-warning',
      name: 'Size Warning',
      description: 'Test rule with options',
      category: 'CLAUDE.md',
      severity: 'warn',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
      schema: z.object({
        maxSize: z.number().positive().optional(),
        reportZeroSize: z.boolean().optional(),
      }),
      defaultOptions: {
        maxSize: 30000,
        reportZeroSize: false,
      },
    });

    RuleRegistry.register({
      id: 'claude-md-import-circular',
      name: 'Import Circular',
      description: 'Test rule for overrides',
      category: 'CLAUDE.md',
      severity: 'error',
      fixable: false,
      deprecated: false,
      since: '1.0.0',
    });
  });

  afterAll(() => {
    RuleRegistry.clear();
  });

  describe('isRuleEnabledInConfig', () => {
    it('should return true when no config is provided', () => {
      const validator = new TestValidator({});

      validator.testSetCurrentFile('test.md');
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(true);
    });

    it('should return true for enabled rules', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(true);
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-warning')).toBe(true);
    });

    it('should return false for disabled rules', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'off',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(false);
    });

    it('should return true for unconfigured rules that exist in registry', () => {
      const config: ClaudeLintConfig = {
        rules: {
          // size-error not configured
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      // Rule exists in registry but not configured = enabled by default
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(true);
    });

    it('should respect file-specific overrides', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('README.md');
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(true);

      validator.testSetCurrentFile('test.skill.md');
      expect(validator.testIsRuleEnabledInConfig('claude-md-size-error')).toBe(false);
    });
  });

  describe('getRuleOptions', () => {
    it('should return default options when no config is provided', () => {
      const validator = new TestValidator({});

      validator.testSetCurrentFile('test.md');
      const options = validator.testGetRuleOptions<{ maxSize?: number; reportZeroSize?: boolean }>(
        'claude-md-size-warning'
      );

      expect(options).toEqual({
        maxSize: 30000,
        reportZeroSize: false,
      });
    });

    it('should return undefined for rules without default options', () => {
      const validator = new TestValidator({});

      validator.testSetCurrentFile('test.md');
      const options = validator.testGetRuleOptions('claude-md-size-error');

      expect(options).toBeUndefined();
    });

    it('should return configured options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'error',
            options: {
              maxSize: 50000,
              reportZeroSize: true,
            },
          },
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      const options = validator.testGetRuleOptions<{ maxSize?: number; reportZeroSize?: boolean }>(
        'claude-md-size-warning'
      );

      expect(options).toEqual({
        maxSize: 50000,
        reportZeroSize: true,
      });
    });

    it('should respect file-specific override options', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': {
            severity: 'warn',
            options: {
              maxSize: 30000,
            },
          },
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-warning': {
                severity: 'error',
                options: {
                  maxSize: 60000,
                },
              },
            },
          },
        ],
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('README.md');
      let options = validator.testGetRuleOptions<{ maxSize?: number }>('claude-md-size-warning');
      expect(options?.maxSize).toBe(30000);

      validator.testSetCurrentFile('test.skill.md');
      options = validator.testGetRuleOptions<{ maxSize?: number }>('claude-md-size-warning');
      expect(options?.maxSize).toBe(60000);
    });
  });

  describe('report with config', () => {
    it('should report error when rule severity is error', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      validator.testReport('Test error', 'test.md', 1, 'claude-md-size-error');

      const result = validator.getResult();
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].message).toBe('Test error');
    });

    it('should skip issue when rule is disabled in config', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'off',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      validator.testReport('Test error', 'test.md', 1, 'claude-md-size-error');

      const result = validator.getResult();
      expect(result.errors.length).toBe(0);
    });

    it('should respect file-specific overrides', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
        overrides: [
          {
            files: ['**/*.skill.md'],
            rules: {
              'claude-md-size-error': 'off',
            },
          },
        ],
      };

      const validator = new TestValidator({ config });

      // File not matching override - should report error
      validator.testSetCurrentFile('README.md');
      validator.testReport('Test error 1', 'README.md', 1, 'claude-md-size-error');

      // File matching override - should skip error
      validator.testSetCurrentFile('test.skill.md');
      validator.testReport('Test error 2', 'test.skill.md', 1, 'claude-md-size-error');

      const result = validator.getResult();
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].file).toBe('README.md');
    });

    it('should respect inline disable comments even with config', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const validator = new TestValidator({ config });
      const filePath = 'test.md';

      // Parse disable comments first
      validator.testParseDisableComments(
        filePath,
        '<!-- claudelint-disable-line claude-md-size-error -->\n'
      );

      validator.testSetCurrentFile(filePath);
      validator.testReport('Test error', filePath, 1, 'claude-md-size-error');

      const result = validator.getResult();
      expect(result.errors.length).toBe(0);
    });

    it('should report warning when rule severity is warn', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': 'warn',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      validator.testReport('Test warning', 'test.md', 1, 'claude-md-size-warning');

      const result = validator.getResult();
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].message).toBe('Test warning');
    });

    it('should skip warning when rule is disabled in config', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': 'off',
        },
      };

      const validator = new TestValidator({ config });

      validator.testSetCurrentFile('test.md');
      validator.testReport('Test warning', 'test.md', 1, 'claude-md-size-warning');

      const result = validator.getResult();
      expect(result.warnings.length).toBe(0);
    });

    it('should respect file-specific overrides for warnings', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-warning': 'warn',
        },
        overrides: [
          {
            files: ['docs/**'],
            rules: {
              'claude-md-size-warning': 'off',
            },
          },
        ],
      };

      const validator = new TestValidator({ config });

      // File not matching override - should report warning
      validator.testSetCurrentFile('README.md');
      validator.testReport('Test warning 1', 'README.md', 1, 'claude-md-size-warning');

      // File matching override - should skip warning
      validator.testSetCurrentFile('docs/guide.md');
      validator.testReport('Test warning 2', 'docs/guide.md', 1, 'claude-md-size-warning');

      const result = validator.getResult();
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].file).toBe('README.md');
    });
  });

  describe('backward compatibility', () => {
    it('should work without config (all rules enabled)', () => {
      const validator = new TestValidator({});

      validator.testSetCurrentFile('test.md');
      validator.testReport('Error 1', 'test.md', 1, 'claude-md-size-error');
      validator.testReport('Warning 1', 'test.md', 2, 'claude-md-size-warning');

      const result = validator.getResult();
      expect(result.errors.length).toBe(1);
      expect(result.warnings.length).toBe(1);
    });

    it('should return default options when no config provided', () => {
      const validator = new TestValidator({});

      validator.testSetCurrentFile('test.md');
      const options = validator.testGetRuleOptions<{ maxSize?: number; reportZeroSize?: boolean }>(
        'claude-md-size-warning'
      );

      // Should use defaults from registry
      expect(options).toEqual({
        maxSize: 30000,
        reportZeroSize: false,
      });
    });

    it('should work before setCurrentFile is called', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
        },
      };

      const validator = new TestValidator({ config });

      // Don't call setCurrentFile - should still work with file parameter
      validator.testReport('Error', 'test.md', 1, 'claude-md-size-error');

      const result = validator.getResult();
      // Config is checked based on file parameter, not currentFile
      expect(result.errors.length).toBe(1);
    });
  });

  describe('config and inline disable interaction', () => {
    it('should respect both config disables and inline disables', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error',
          'claude-md-size-warning': 'warn',
          'claude-md-import-circular': 'off', // Disabled via config
        },
      };

      const validator = new TestValidator({ config });
      const filePath = 'test.md';

      // Parse disable comment for size-error
      validator.testParseDisableComments(
        filePath,
        '<!-- claudelint-disable-line claude-md-size-error -->\n'
      );

      validator.testSetCurrentFile(filePath);

      // size-error: disabled via inline comment
      validator.testReport('Error 1', filePath, 1, 'claude-md-size-error');

      // size-warning: enabled, should report
      validator.testReport('Warning 1', filePath, 2, 'claude-md-size-warning');

      // import-circular: disabled via config
      validator.testReport('Error 2', filePath, 3, 'claude-md-import-circular');

      const result = validator.getResult();
      expect(result.errors.length).toBe(0); // Both disabled
      expect(result.warnings.length).toBe(1); // Only size-warning reported
    });

    it('should prioritize inline disable over config enable', () => {
      const config: ClaudeLintConfig = {
        rules: {
          'claude-md-size-error': 'error', // Enabled in config
        },
      };

      const validator = new TestValidator({ config });
      const filePath = 'test.md';

      // Inline disable should take priority
      validator.testParseDisableComments(
        filePath,
        '<!-- claudelint-disable-file claude-md-size-error -->\n'
      );

      validator.testSetCurrentFile(filePath);
      validator.testReport('Error', filePath, 1, 'claude-md-size-error');

      const result = validator.getResult();
      expect(result.errors.length).toBe(0); // Inline disable wins
    });
  });
});
