/**
 * Tests for deprecation tracking in FileValidator
 */

import { FileValidator, ValidationResult, BaseValidatorOptions } from '../../src/validators/file-validator';
import { Rule } from '../../src/types/rule';
import { RuleId } from '../../src/rules/rule-ids';

/**
 * Concrete test implementation of FileValidator
 */
class TestValidator extends FileValidator {
  private testRules: Rule[] = [];

  constructor(options: BaseValidatorOptions = {}) {
    super(options);
  }

  /**
   * Add a test rule to execute
   */
  addTestRule(rule: Rule): void {
    this.testRules.push(rule);
  }

  /**
   * Execute test validation
   */
  async validate(): Promise<ValidationResult> {
    // Execute each test rule
    for (const rule of this.testRules) {
      await this.executeRule(rule, '/test/file.md', 'test content');
    }

    return this.getResult();
  }
}

describe('FileValidator - Deprecation Tracking', () => {
  beforeEach(() => {
    // Clear any existing test rules
    jest.clearAllMocks();
  });

  describe('Deprecated Rule Detection', () => {
    it('should track deprecated rule with boolean format', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule (Boolean)',
          description: 'Test deprecated rule',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: true,
          since: '1.0.0',
        },
        validate: async () => {
          // No-op
        },
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed).toHaveLength(1);
      expect(result.deprecatedRulesUsed![0]).toMatchObject({
        ruleId: 'plugin-circular-dependency',
        reason: 'This rule has been deprecated',
      });
    });

    it('should track deprecated rule with DeprecationInfo format', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-dependency-invalid-version' as RuleId,
          name: 'Deprecated Rule (Rich)',
          description: 'Test deprecated rule',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'This rule validates a field that does not exist in the official spec',
            replacedBy: 'plugin-invalid-marketplace-manifest' as RuleId,
            deprecatedSince: '0.3.0',
            removeInVersion: '1.0.0',
            url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md',
          },
          since: '1.0.0',
        },
        validate: async () => {
          // No-op
        },
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed).toHaveLength(1);
      expect(result.deprecatedRulesUsed![0]).toMatchObject({
        ruleId: 'plugin-dependency-invalid-version',
        reason: 'This rule validates a field that does not exist in the official spec',
        replacedBy: ['plugin-invalid-marketplace-manifest'],
        deprecatedSince: '0.3.0',
        removeInVersion: '1.0.0',
        url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md',
      });
    });

    it('should track multiple deprecated rules', async () => {
      const rule1: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule 1',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: true,
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const rule2: Rule = {
        meta: {
          id: 'plugin-dependency-invalid-version' as RuleId,
          name: 'Deprecated Rule 2',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'No longer needed',
            replacedBy: ['plugin-invalid-marketplace-manifest' as RuleId, 'plugin-name-invalid' as RuleId],
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const validator = new TestValidator();
      validator.addTestRule(rule1);
      validator.addTestRule(rule2);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed).toHaveLength(2);
      expect(result.deprecatedRulesUsed!.map((d) => d.ruleId)).toEqual([
        'plugin-circular-dependency',
        'plugin-dependency-invalid-version',
      ]);
    });

    it('should not track non-deprecated rules', async () => {
      const normalRule: Rule = {
        meta: {
          id: 'claude-md-size' as RuleId,
          name: 'Normal Rule',
          description: 'Test',
          category: 'CLAUDE.md',
          severity: 'error',
          fixable: false,
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const validator = new TestValidator();
      validator.addTestRule(normalRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeUndefined();
    });

    it('should not track deprecated rules that are disabled in config', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: true,
          since: '1.0.0',
        },
        validate: async () => {},
      };

      // Create validator with config that disables the rule
      const validator = new TestValidator({
        config: {
          rules: {
            'plugin-circular-dependency': 'off',
          },
        },
      });

      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      // Rule should not be tracked because it was disabled
      expect(result.deprecatedRulesUsed).toBeUndefined();
    });

    it('should handle array replacedBy correctly', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Split into multiple rules',
            replacedBy: [
              'plugin-invalid-marketplace-manifest' as RuleId,
              'plugin-name-invalid' as RuleId,
              'plugin-version-invalid' as RuleId,
            ],
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed![0].replacedBy).toEqual([
        'plugin-invalid-marketplace-manifest',
        'plugin-name-invalid',
        'plugin-version-invalid',
      ]);
    });

    it('should handle single string replacedBy correctly', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Replaced by better rule',
            replacedBy: 'plugin-invalid-marketplace-manifest' as RuleId,
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed![0].replacedBy).toEqual(['plugin-invalid-marketplace-manifest']);
    });

    it('should handle removeInVersion: null correctly', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Deprecated but kept for compatibility',
            removeInVersion: null,
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed![0].removeInVersion).toBeNull();
    });
  });

  describe('Deprecation with Validation Issues', () => {
    it('should track deprecation even when rule reports issues', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Old rule',
            replacedBy: 'plugin-invalid-marketplace-manifest' as RuleId,
          },
          since: '1.0.0',
        },
        validate: async (context) => {
          // Rule finds an issue
          context.report({
            message: 'Found an issue',
            line: 10,
          });
        },
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      // Should have both the issue AND the deprecation tracking
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Found an issue');
      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed).toHaveLength(1);
      expect(result.deprecatedRulesUsed![0].ruleId).toBe('plugin-circular-dependency');
    });

    it('should track deprecation even when rule finds no issues', async () => {
      const deprecatedRule: Rule = {
        meta: {
          id: 'plugin-circular-dependency' as RuleId,
          name: 'Deprecated Rule',
          description: 'Test',
          category: 'Plugin',
          severity: 'error',
          fixable: false,
          deprecated: true,
          since: '1.0.0',
        },
        validate: async () => {
          // Rule finds nothing
        },
      };

      const validator = new TestValidator();
      validator.addTestRule(deprecatedRule);
      const result = await validator.validate();

      // Should have no errors but still track deprecation
      expect(result.errors).toHaveLength(0);
      expect(result.deprecatedRulesUsed).toBeDefined();
      expect(result.deprecatedRulesUsed).toHaveLength(1);
    });
  });
});
