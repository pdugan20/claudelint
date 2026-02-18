/**
 * Tests for preset JSON generation
 *
 * Verifies that the generated preset files contain the correct rules
 * based on registry metadata.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Import rule registration (side-effect: populates registry)
import '../../src/rules/index';
import { RuleRegistry } from '../../src/utils/rules/registry';

const PRESETS_DIR = join(__dirname, '../../presets');

describe('preset generation', () => {
  let recommendedPreset: { rules: Record<string, string> };
  let strictPreset: { rules: Record<string, string> };
  let allPreset: { rules: Record<string, string> };

  beforeAll(() => {
    recommendedPreset = JSON.parse(readFileSync(join(PRESETS_DIR, 'recommended.json'), 'utf-8'));
    strictPreset = JSON.parse(readFileSync(join(PRESETS_DIR, 'strict.json'), 'utf-8'));
    allPreset = JSON.parse(readFileSync(join(PRESETS_DIR, 'all.json'), 'utf-8'));
  });

  describe('recommended.json', () => {
    it('is exhaustive — contains every registered rule', () => {
      const rules = RuleRegistry.getAllRules();
      const registeredIds = rules.map((r) => r.meta.id).sort();
      const presetIds = Object.keys(recommendedPreset.rules).sort();

      expect(presetIds).toEqual(registeredIds);
    });

    it('enables recommended rules at source severity', () => {
      const rules = RuleRegistry.getAllRules();

      for (const rule of rules) {
        if (rule.meta.docs?.recommended) {
          expect(recommendedPreset.rules[rule.meta.id]).toBe(rule.meta.severity);
        }
      }
    });

    it('sets non-recommended rules to "off"', () => {
      const rules = RuleRegistry.getAllRules();
      const notRecommended = rules.filter((r) => !r.meta.docs?.recommended);

      for (const rule of notRecommended) {
        expect(recommendedPreset.rules[rule.meta.id]).toBe('off');
      }
    });

    it('has a rules object at top level', () => {
      expect(recommendedPreset).toHaveProperty('rules');
      expect(typeof recommendedPreset.rules).toBe('object');
    });
  });

  describe('strict.json', () => {
    it('is exhaustive — contains every registered rule', () => {
      const rules = RuleRegistry.getAllRules();
      const registeredIds = rules.map((r) => r.meta.id).sort();
      const presetIds = Object.keys(strictPreset.rules).sort();

      expect(presetIds).toEqual(registeredIds);
    });

    it('enables recommended + strict rules at source severity', () => {
      const rules = RuleRegistry.getAllRules();

      for (const rule of rules) {
        if (rule.meta.docs?.recommended || rule.meta.docs?.strict) {
          expect(strictPreset.rules[rule.meta.id]).toBe(rule.meta.severity);
        }
      }
    });

    it('sets non-strict/non-recommended rules to "off"', () => {
      const rules = RuleRegistry.getAllRules();
      const excluded = rules.filter((r) => !r.meta.docs?.recommended && !r.meta.docs?.strict);

      for (const rule of excluded) {
        expect(strictPreset.rules[rule.meta.id]).toBe('off');
      }
    });

    it('has more enabled rules than recommended but fewer than all', () => {
      const strictEnabled = Object.values(strictPreset.rules).filter((s) => s !== 'off').length;
      const recEnabled = Object.values(recommendedPreset.rules).filter((s) => s !== 'off').length;
      const allEnabled = Object.values(allPreset.rules).filter((s) => s !== 'off').length;

      expect(strictEnabled).toBeGreaterThan(recEnabled);
      expect(strictEnabled).toBeLessThan(allEnabled);
    });
  });

  describe('all.json', () => {
    it('contains every registered rule', () => {
      const registeredIds = RuleRegistry.getAllRules()
        .map((r) => r.meta.id)
        .sort();

      const presetIds = Object.keys(allPreset.rules).sort();

      expect(presetIds).toEqual(registeredIds);
    });

    it('uses source severity for each rule', () => {
      const rules = RuleRegistry.getAllRules();

      for (const [ruleId, severity] of Object.entries(allPreset.rules)) {
        const rule = rules.find((r) => r.meta.id === ruleId);
        expect(rule).toBeDefined();
        expect(severity).toBe(rule!.meta.severity);
      }
    });

    it('has more enabled rules than recommended', () => {
      const allEnabled = Object.values(allPreset.rules).filter((s) => s !== 'off').length;
      const recEnabled = Object.values(recommendedPreset.rules).filter((s) => s !== 'off').length;

      expect(allEnabled).toBeGreaterThan(recEnabled);
    });
  });

  describe('snapshot stability', () => {
    it('recommended.json matches snapshot', () => {
      expect(Object.keys(recommendedPreset.rules).sort()).toMatchSnapshot();
    });

    it('strict.json matches snapshot', () => {
      expect(Object.keys(strictPreset.rules).sort()).toMatchSnapshot();
    });

    it('all.json matches snapshot', () => {
      expect(Object.keys(allPreset.rules).sort()).toMatchSnapshot();
    });
  });
});
