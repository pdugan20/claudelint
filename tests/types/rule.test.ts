/**
 * Tests for rule type definitions and deprecation helpers
 */

import {
  Rule,
  DeprecationInfo,
  isRule,
  isRuleDeprecated,
  getDeprecationInfo,
  getReplacementRuleIds,
} from '../../src/types/rule';
import { RuleId } from '../../src/rules/rule-ids';

describe('Rule Type', () => {
  describe('isRule', () => {
    it('should return true for valid rule', () => {
      const rule: Rule = {
        meta: {
          id: 'claude-md-size' as RuleId,
          name: 'Test Rule',
          description: 'Test description',
          category: 'CLAUDE.md',
          severity: 'error',
          fixable: false,
          since: '1.0.0',
        },
        validate: async () => {},
      };

      expect(isRule(rule)).toBe(true);
    });

    it('should return false for invalid rule (missing meta)', () => {
      const invalid = {
        validate: async () => {},
      };

      expect(isRule(invalid)).toBe(false);
    });

    it('should return false for invalid rule (missing validate)', () => {
      const invalid = {
        meta: {
          id: 'claude-md-size' as RuleId,
          name: 'Test Rule',
          description: 'Test description',
          category: 'CLAUDE.md',
          severity: 'error',
          fixable: false,
          since: '1.0.0',
        },
      };

      expect(isRule(invalid)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRule(null)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isRule('not a rule')).toBe(false);
      expect(isRule(123)).toBe(false);
      expect(isRule(true)).toBe(false);
    });
  });

  describe('Deprecation - Boolean Format', () => {
    const deprecatedRuleBoolean: Rule = {
      meta: {
        id: 'plugin-circular-dependency' as RuleId, // Use actual deprecated rule ID
        name: 'Old Rule',
        description: 'Deprecated rule (boolean)',
        category: 'Plugin',
        severity: 'error',
        fixable: false,
        deprecated: true,
        since: '1.0.0',
      },
      validate: async () => {},
    };

    const nonDeprecatedRule: Rule = {
      meta: {
        id: 'claude-md-size' as RuleId,
        name: 'Current Rule',
        description: 'Not deprecated',
        category: 'CLAUDE.md',
        severity: 'error',
        fixable: false,
        since: '1.0.0',
      },
      validate: async () => {},
    };

    describe('isRuleDeprecated', () => {
      it('should return true for deprecated: true', () => {
        expect(isRuleDeprecated(deprecatedRuleBoolean)).toBe(true);
      });

      it('should return false for non-deprecated rule', () => {
        expect(isRuleDeprecated(nonDeprecatedRule)).toBe(false);
      });

      it('should return false for deprecated: false', () => {
        const rule: Rule = {
          ...nonDeprecatedRule,
          meta: {
            ...nonDeprecatedRule.meta,
            deprecated: false,
          },
        };
        expect(isRuleDeprecated(rule)).toBe(false);
      });
    });

    describe('getDeprecationInfo', () => {
      it('should return minimal info for boolean deprecated', () => {
        const info = getDeprecationInfo(deprecatedRuleBoolean);
        expect(info).toEqual({
          reason: 'This rule has been deprecated',
        });
      });

      it('should return null for non-deprecated rule', () => {
        expect(getDeprecationInfo(nonDeprecatedRule)).toBeNull();
      });
    });

    describe('getReplacementRuleIds', () => {
      it('should return empty array for boolean deprecated with no replacements', () => {
        expect(getReplacementRuleIds(deprecatedRuleBoolean)).toEqual([]);
      });

      it('should return empty array for non-deprecated rule', () => {
        expect(getReplacementRuleIds(nonDeprecatedRule)).toEqual([]);
      });
    });
  });

  describe('Deprecation - DeprecationInfo Format', () => {
    const deprecationInfo: DeprecationInfo = {
      reason: 'This rule validates a field that does not exist in the official spec',
      replacedBy: 'plugin-invalid-marketplace-manifest' as RuleId,
      deprecatedSince: '0.3.0',
      removeInVersion: '1.0.0',
      url: 'https://github.com/pdugan20/claudelint/blob/main/docs/migrations/old-to-new.md',
    };

    const deprecatedRuleObject: Rule = {
      meta: {
        id: 'plugin-dependency-invalid-version' as RuleId, // Use actual deprecated rule ID
        name: 'Old Rule (Rich)',
        description: 'Deprecated rule with rich metadata',
        category: 'Plugin',
        severity: 'error',
        fixable: false,
        deprecated: deprecationInfo,
        since: '1.0.0',
      },
      validate: async () => {},
    };

    describe('isRuleDeprecated', () => {
      it('should return true for DeprecationInfo', () => {
        expect(isRuleDeprecated(deprecatedRuleObject)).toBe(true);
      });
    });

    describe('getDeprecationInfo', () => {
      it('should return full DeprecationInfo', () => {
        const info = getDeprecationInfo(deprecatedRuleObject);
        expect(info).toEqual(deprecationInfo);
      });

      it('should include all fields', () => {
        const info = getDeprecationInfo(deprecatedRuleObject);
        expect(info).toHaveProperty('reason');
        expect(info).toHaveProperty('replacedBy');
        expect(info).toHaveProperty('deprecatedSince');
        expect(info).toHaveProperty('removeInVersion');
        expect(info).toHaveProperty('url');
      });
    });

    describe('getReplacementRuleIds', () => {
      it('should return single replacement as array', () => {
        expect(getReplacementRuleIds(deprecatedRuleObject)).toEqual(['plugin-invalid-marketplace-manifest']);
      });

      it('should return multiple replacements', () => {
        const rule: Rule = {
          ...deprecatedRuleObject,
          meta: {
            ...deprecatedRuleObject.meta,
            deprecated: {
              reason: 'Split into multiple focused rules',
              replacedBy: [
                'claude-md-size' as RuleId,
                'plugin-invalid-marketplace-manifest' as RuleId,
              ],
            },
          },
        };
        expect(getReplacementRuleIds(rule)).toEqual([
          'claude-md-size',
          'plugin-invalid-marketplace-manifest',
        ]);
      });

      it('should return empty array when no replacement specified', () => {
        const rule: Rule = {
          ...deprecatedRuleObject,
          meta: {
            ...deprecatedRuleObject.meta,
            deprecated: {
              reason: 'No longer needed',
            },
          },
        };
        expect(getReplacementRuleIds(rule)).toEqual([]);
      });
    });
  });

  describe('Deprecation - Edge Cases', () => {
    it('should handle deprecated with minimal fields', () => {
      const rule: Rule = {
        meta: {
          id: 'skills-missing-changelog' as RuleId,
          name: 'Minimal',
          description: 'Test',
          category: 'Skills',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Just a reason',
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      expect(isRuleDeprecated(rule)).toBe(true);
      const info = getDeprecationInfo(rule);
      expect(info?.reason).toBe('Just a reason');
      expect(info?.replacedBy).toBeUndefined();
      expect(info?.deprecatedSince).toBeUndefined();
      expect(info?.removeInVersion).toBeUndefined();
      expect(info?.url).toBeUndefined();
    });

    it('should handle removeInVersion: null (retained indefinitely)', () => {
      const rule: Rule = {
        meta: {
          id: 'hooks-invalid-config' as RuleId,
          name: 'Retained',
          description: 'Test',
          category: 'Hooks',
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

      const info = getDeprecationInfo(rule);
      expect(info?.removeInVersion).toBeNull();
    });

    it('should handle single replacement as string', () => {
      const rule: Rule = {
        meta: {
          id: 'mcp-invalid-transport' as RuleId,
          name: 'Test',
          description: 'Test',
          category: 'MCP',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Test',
            replacedBy: 'mcp-invalid-transport' as RuleId,
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      expect(getReplacementRuleIds(rule)).toEqual(['mcp-invalid-transport']);
    });

    it('should handle array replacement', () => {
      const rule: Rule = {
        meta: {
          id: 'agent-model' as RuleId,
          name: 'Test',
          description: 'Test',
          category: 'Agents',
          severity: 'error',
          fixable: false,
          deprecated: {
            reason: 'Test',
            replacedBy: ['agent-tools' as RuleId, 'agent-skills' as RuleId],
          },
          since: '1.0.0',
        },
        validate: async () => {},
      };

      expect(getReplacementRuleIds(rule)).toEqual(['agent-tools', 'agent-skills']);
    });
  });
});
